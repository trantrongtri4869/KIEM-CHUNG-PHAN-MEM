const express = require("express");
const { body, validationResult } = require("express-validator");
const { User } = require("../models");
const { signToken, protect } = require("../middleware/auth");

const router = express.Router();

const handleValidation = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    return null;
};

// =====================================================
// REGISTER
// =====================================================

router.post(
    "/register",
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required"),

        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Valid email required"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {

        const validation = handleValidation(req, res);
        if (validation) return;

        try {

            const { name, email, password } = req.body;

            const existed = await User.findOne({ email });

            if (existed) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            const user = await User.create({
                name,
                email,
                password,
            });

            const token = signToken(user._id);

            return res.status(201).json({
                success: true,
                data: {
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt,
                    },
                    token,
                },
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });

        }

    }
);

// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Valid email required"),

        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ],
    async (req, res) => {

        const validation = handleValidation(req, res);
        if (validation) return;

        try {

            const { email, password } = req.body;

            const user = await User.findOne({ email })
                .select("+password");

            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });

            }

            const matched = await user.comparePassword(password);

            if (!matched) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });

            }

            const token = signToken(user._id);

            return res.json({

                success: true,

                data: {

                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt,
                    },

                    token,

                },

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });

        }

    }
);

// =====================================================
// GET PROFILE
// =====================================================

router.get("/profile", protect, async (req, res) => {

    return res.json({

        success: true,

        data: req.user,

    });

});

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put("/profile", protect, async (req, res) => {

    try {

        const updateData = {};

        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
        }

        if (req.body.email !== undefined) {

            const existed = await User.findOne({

                email: req.body.email,

                _id: {
                    $ne: req.user._id,
                },

            });

            if (existed) {

                return res.status(409).json({

                    success: false,

                    message: "Email already exists",

                });

            }

            updateData.email = req.body.email;

        }

        const user = await User.findByIdAndUpdate(

            req.user._id,

            updateData,

            {
                new: true,
                runValidators: true,
            }

        ).select("-password");

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found",

            });

        }

        return res.json({

            success: true,

            data: user,

        });

    } catch (err) {

        if (err.code === 11000) {

            return res.status(409).json({

                success: false,

                message: "Email already exists",

            });

        }

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

});

// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post("/forgot-password", async (req, res) => {

    const { email } = req.body;

    return res.json({

        success: true,

        message: `Password reset email sent to ${email}`,

    });

});

module.exports = router;