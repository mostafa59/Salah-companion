import User from '../models/User.js';
import Friendship from '../models/Friendship.js';

// 1. GET /api/friends - Get all accepted friends
export const getFriends = async (req, res) => {
  try {
    const { userId } = req.query;

    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name friendCode');

    const friends = friendships.map(f => {
      const friend = f.requester._id.toString() === userId ? f.recipient : f.requester;
      return {
        id: friend._id,
        name: friend.name,
        code: friend.friendCode
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 2. GET /api/friends/requests - Get pending requests
export const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.query;

    const incoming = await Friendship.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'name friendCode');

    const outgoing = await Friendship.find({
      requester: userId,
      status: 'pending'
    }).populate('recipient', 'name friendCode');

    res.json({
      incoming: incoming.map(f => ({
        id: f._id,
        from: { name: f.requester.name, code: f.requester.friendCode }
      })),
      outgoing: outgoing.map(f => ({
        id: f._id,
        to: { name: f.recipient.name, code: f.recipient.friendCode }
      }))
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 3. POST /api/friends/add - Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId, friendCode } = req.body;

    // Find user by friend code
    const recipient = await User.findOne({ friendCode });
    if (!recipient) {
      return res.status(404).json({ msg: 'رمز غير موجود' });
    }

    if (recipient._id.toString() === userId) {
      return res.status(400).json({ msg: 'لا يمكنك إضافة نفسك!' });
    }

    // Check if already friends or pending
    const existing = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: recipient._id },
        { requester: recipient._id, recipient: userId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ msg: 'أنتما أصدقاء بالفعل!' });
      }
      return res.status(400).json({ msg: 'الطلب موجود بالفعل' });
    }

    // Create new friendship request
    await Friendship.create({
      requester: userId,
      recipient: recipient._id,
      status: 'pending'
    });

    res.json({ msg: 'تم إرسال الطلب بنجاح!' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 4. POST /api/friends/respond - Accept/Reject request
export const respondToRequest = async (req, res) => {
  try {
    const { userId, friendshipId, action } = req.body;

    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      return res.status(404).json({ msg: 'الطلب غير موجود' });
    }

    if (friendship.recipient.toString() !== userId) {
      return res.status(403).json({ msg: 'غير مصرح' });
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      res.json({ msg: 'تم قبول الطلب!' });
    } else if (action === 'reject') {
      await Friendship.findByIdAndDelete(friendshipId);
      res.json({ msg: 'تم رفض الطلب' });
    } else {
      res.status(400).json({ msg: 'إجراء غير صالح' });
    }
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};
