const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, rememberMe = false) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }
    const user = await User.create({ nom, email, password, role });
    res.status(201).json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, false),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    res.status(200).json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, rememberMe),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };