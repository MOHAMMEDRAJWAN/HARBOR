function onlyRetailer(req, res, next) {
  if (req.user.role.toLowerCase() !== "retailer") {
    return res.status(403).json({ message: "Retailer access only" });
  }
  next();
}


function onlyWholesaler(req, res, next) {
  if (req.user.role.toLowerCase() !== "wholesaler") {
    return res.status(403).json({ message: "Wholesaler access only" });
  }
  next();
}


function onlyAgent(req, res, next) {
  if (req.user.role.toLowerCase() !== "agent") {
    return res.status(403).json({ message: "Agent access only" });
  }
  next();
}

module.exports = {
  onlyRetailer,
  onlyWholesaler,
  onlyAgent,
};
