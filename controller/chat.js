const { sequelize } = require("../models");
const { Op } = require("sequelize");

async function CreateConversation(req, res) {
  try {
    const { senderId, receiveId } = req.body;

    const user = await sequelize.models.Users.findByPk(receiveId);
    if (!user) {
      return res.status(400).json("User not found");
    }
    if (senderId === receiveId) {
      return res.status(400).json("senderId and receiveId cannot be same");
    }
    if (!senderId || !receiveId) {
      return res.status(400).json("Please input senderId and receiveId");
    }

    const check = await sequelize.models.Conversations.findAll({
      where: {
        members: { [Op.contains]: [senderId, receiveId] },
      },
    });
    if (check && check.length > 0) {
      return res.status(400).json("conversation already exists");
    }
    const newConversation = await sequelize.models.Conversations.create({
      members: [senderId, receiveId],
    });
    await newConversation.save();
    return res.status(201).json("conversation created successfully");
  } catch (error) {
    console.log(error.message);
  }
}

async function GetConversation(req, res) {
  try {
    const { userId } = req.params;

    const conversation = await sequelize.models.Conversations.findAll({
      where: { members: { [Op.contains]: [userId] } },
    });
    const userData = Promise.all(
      conversation.map(async (conversation) => {
        const receiveId = conversation.members.find((id) => id !== +userId);
        const user = await sequelize.models.Users.findByPk(receiveId);
        return {
          user: { id: user.id, email: user.email, fullName: user.fullName },
          conversationId: conversation.id,
        };
      })
    );
    return res.status(200).json(await userData);
  } catch (error) {
    console.error(error);
  }
}

async function CreateMessage(req, res) {
  try {
    const { conversationId, senderId, message, receiveId } = req.body;

    if (!senderId || !message) {
      return res.status(400).json("Please provide senderId and message");
    }

    if (conversationId === "new" && receiveId) {
      const findCeonversation = await sequelize.models.Conversations.findAll({
        where: {
          members: { [Op.contains]: [senderId, receiveId] },
        }
      })
      if (findCeonversation.length === 0) {
        const newConversation = await sequelize.models.Conversations.create({
          members: [senderId, receiveId],
        });
        await newConversation.save();
        const newMessages = await sequelize.models.Messages.create({
          conversationId: newConversation.id,
          senderId,
          message,
        });
        await newMessages.save();
        return res.status(201).json("Message sent successfully");
        
      } else {
        const newMessages = await sequelize.models.Messages.create({
          conversationId: findCeonversation[0].id,
          senderId,
          message,
        });
        await newMessages.save();
        return res.status(201).json("Message sent successfully");
      }
     
    } else if (!conversationId && !receiveId) {
      return res.status(400).json("Please fill all the required fields");
    }

    const newMessage = await sequelize.models.Messages.create({
      conversationId,
      senderId,
      message,
    });

    await newMessage.save();

    return res.status(201).json("Message sent successfully");
  } catch (error) {
    console.error(error.message);
    return res.status(500).json("Internal Server Error");
  }
}

async function GetMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const { senderId, receiveId } = req.query;

    const checkMessage = async (conversationId) => {
      const messages = await sequelize.models.Messages.findAll({
        where: { conversationId },
      });
      const messageUserData = Promise.all(
        messages.map(async (message) => {
          const user = await sequelize.models.Users.findByPk(message.senderId);
          return {
            user: { id: user.id, email: user.email, fullName: user.fullName },
            message: message.message,
          };
        })
      );
      return res.status(200).json(await messageUserData);
    };


    if (conversationId === "new") {
      const checkConcersation = await sequelize.models.Conversations.findAll({
        where: {
          members: { [Op.contains]: [senderId, receiveId] },
        },
      });
      if (checkConcersation.length > 0) {
        checkMessage(checkConcersation[0].id);
      } else {
        return res.status(200).json([]);
      }
    } else {
      checkMessage(conversationId);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  CreateConversation,
  GetConversation,
  CreateMessage,
  GetMessages,
};
