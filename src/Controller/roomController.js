const Room = require('../Models/roomModels');


class RoomController {
  async addRoom(req, res) {
    const { name, floor } = req.body;


    const newRoom = new Room({
      name,
      floor,
    });
    newRoom.save()
      .then(() => {
        res.send('Room created successfully');
      })
      .catch((error) => {
        res.status(500).send('Error creating room');
      });
  }
}
module.exports = new RoomController();