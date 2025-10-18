// Simulated authentication middleware
// Replace with JWT verification

function mockAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    // Testing as volunteer or admin
    if (!authHeader) {
        req.user = { id: 99, role: "admin" };
        return next();
    }

    try {
        // Simulate decoding token (base64 JSON)
        const token = authHeader.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
        req.user = decoded; // example: { id: 99, role: "admin" }
        next();
    } catch (err) {
        console.error("Invalid token format:", err.message);
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized: invalid token" });
    }
}

module.exports = { mockAuth };