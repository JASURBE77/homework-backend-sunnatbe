const User = require("../models/users.model");

exports.getallTopTypings = async (req, res) => {
    try {
        const typers = await User.find().select("name wpm").sort({ typing: -1 }).limit(5);
        res.status(200).json(typers);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}