import { User } from "../Models/User.model.js";
import { PassReset } from "../Models/changePass.model.js";
import { verifyUserData } from "../utility/userInputVerify.js";
import { generate_accessToken, generate_refreshToken, generate_passToken } from "../utility/generateToken.js";
import { sendEmail, verifyEmail, pas_Email } from "../utility/sendEmail_verify.js";
import { fileUploadOnCloudinary, removeFileFromCloudinary } from "../utility/fileUpload_remove.js"
import jwt from "jsonwebtoken"
import { generateUniqueUserName } from "../utility/userNameGenerator.js"
import bcrypt from "bcryptjs";

// register user
const valid_register = async (req, res) => {
    try {
        const { fullName, email, password, role, phoneNumber, totalLawyer, address } = req.body;

        // Required field check
        if (!fullName || !email || !password || !role || !phoneNumber) {
            return res.status(400).json({ statusCode: 400, message: "All fields are required" });
        }

        // Validate inputs 
        const inputVerify = verifyUserData(req.body);
        if (!inputVerify.isValid) {
            return res.status(400).json({ statusCode: 400, message: inputVerify.errors });
        }

        // Check if user already exists
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({ statusCode: 400, message: "User already exists" });
        }

        // Send email verification code
        const verificationCode = await sendEmail(email);
        if (!verificationCode) {
            return res.status(500).json({ statusCode: 500, message: "Something went wrong while sending the email" });
        }

        // Save info in session
        req.session.userInfo = { fullName, email, password, role, phoneNumber, totalLawyer, address };
        req.session.emailCode = verificationCode;

        // save the session
        req.session.save(err => {
            if (err) console.error("Session save error:", err);
        });

        return res.status(200).json({ statusCode: 200, message: "Verification code sent to your email. Please verify it.", });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error", error: error.message, });
    }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
    try {
        const { userInfo } = req.session;
        if (!userInfo?.email) {
            return res.status(400).json({ statusCode: 400, message: "Session expired or user not found." });
        }

        // resend email  
        const verificationCode = await sendEmail(userInfo.email);
        console.log(verificationCode)
        req.session.emailCode = verificationCode;

        req.session.save(err => {
            if (err) console.error("Session save error:", err);
        });

        return res.status(200).json({ statusCode: 200, message: "New verification code sent to your email." });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error while resending verification code.", error: error.message });
    }
};

// verify and register user
const register_user = async (req, res) => {
    try {
        // get info
        const { code } = req.body;
        const { emailCode, userInfo } = req.session;
        const { fullName, email, password, role, phoneNumber, totalLawyer, address } = userInfo

        // verify email
        const verifyMail = verifyEmail(code, emailCode);
        if (!verifyMail) {
            return res.status(401).json({ statusCode: 400, message: "Invalid email code" })
        }
        // assign userName 
        const userName = await generateUniqueUserName(fullName);
        if (!userName) {
            return res.status(401).json({ statusCode: 400, message: "failed to generate userName" })
        }

        // hashed the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create the new user user
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            userName,
            role,
            phoneNumber,
            address,
            ...(role === "law firm" && { totalLawyer })
        })


        await user.save();


        // generate tokens
        const accessToken = generate_accessToken(user._id);
        const refreshToken = generate_refreshToken(user._id);

        // update db and add refreshtoken 
        user.refreshToken = refreshToken
        await user.save();

        // create user object
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            return res.status(500).json({ statusCode: 500, message: "Internal server error" });
        }

        req.session.userInfo = null;
        req.session.emailCode = null;

        req.session.destroy(err => {
            if (err) console.error("Session destroy error:", err);
        });

        return res.status(200).json({ statusCode: 200, message: "User create successfully", data: createdUser, accesstoken: accessToken });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error", error: error.message })
    }
}

// login user 
const login = async (req, res) => {
    try {
        const { email, userName, password } = req.body;

        if ((!email && !userName) || !password) {
            return res.status(400).json({ statusCode: 400, message: "Email or Username and Password are required" });
        }

        // check user input is valid
        const inputVerify = verifyUserData(req.body);
        if (!inputVerify.isValid) {
            return res.status(400).json({ statusCode: 400, message: inputVerify.errors })
        }

        // find the user in db
        const user = await User.findOne({ $or: [{ email }, { userName }], });
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User did not have exist" })
        }

        // compare the pass 
        const matchPass = await bcrypt.compare(password, user.password)
        if (!matchPass) {
            return res.status(400).json({ statusCode: 400, message: "Incorrect Password" })
        }

        // generate tokens
        const accessToken = generate_accessToken(user._id);
        const refreshToken = generate_refreshToken(user._id);

        // update db and add refreshtoken 
        user.refreshToken = refreshToken;
        await user.save();

        // create user object
        const logIn_User = await User.findById(user._id).select("-password -refreshToken");
        if (!logIn_User) {
            return res.status(500).json({ statusCode: 500, message: "Internal server error" });
        }

        return res.status(200).json({ statusCode: 200, message: "User Login successfully", data: logIn_User, accesstoken: accessToken });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Internal server error", error: error.message })
    }
}

// logout user
const logOut = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(400).json({ statusCode: 400, message: "User is unauthroized" })
        };

        // delete refreshToken from database 
        await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: "" } })

        // clear cookies 
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken")

        return res.status(200).json({ statusCode: 200, message: "User logOut Successfully" })

    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error during LogOut the user.", error: error.message });
    }
}

// change avatar
const changeAvatar = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "User did not found" })
        };

        // Check if shopLogo file is provided
        if (!req.files || !req.files.avatar || req.files.avatar.length === 0) {
            return res.status(400).json({ statusCode: 400, message: "Avatar file is required" });
        }

        const avatarPath = req.files.avatar[0].path

        // check if the user exists
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User does not exist" });
        }

        // If user has an existing avatar, clear it
        if (user.avatar?.public_Id) {
            const resourceType = "image"
            await removeFileFromCloudinary(user.avatar.public_Id, resourceType);
        }

        // upload avatar to Cloudinary
        const folder = "DLD/User Avatar"
        const resourceType = "image"
        const fileUpload = await fileUploadOnCloudinary(avatarPath, folder, resourceType);

        // update in db
        user.avatar = {
            avatarUrl: fileUpload.url,
            public_Id: fileUpload.public_id,
        }
        await user.save();

        return res.status(200).json({ statusCode: 200, data: fileUpload.url, message: "Avatar updated successfully" });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Something went wrong while updating the avatar", error: error.message });
    }
}

// login is required
const editProfile = async (req, res) => {
    try {
        // get user id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ statusCode: 401, message: "Unauthorized user" });
        }

        // find the user in db
        const currentUser = await User.findById(userId).select("-password -refreshToken");
        if (!currentUser) {
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }
        const { email, fullName, userName, totalLawyer, address } = req.body;

        if (!email || !userName || !fullName || !address) {
            return res.status(400).json({ statusCode: 400, message: "Email and Username and fullName and address are required" });
        }
        if (currentUser.role === "law firm" && !totalLawyer) {
            return res.status(400).json({ statusCode: 400, message: "total Lawyer is required" });
        }

        // Validate basic user input
        const inputVerify = verifyUserData(req.body)
        if (!inputVerify.isValid) {
            return res.status(400).json({ statusCode: 400, message: inputVerify.errors });
        }

        // Check for duplicate username/email
        const checkUser = await User.findOne({
            $or: [{ userName }, { email }],
            _id: { $ne: userId }
        });

        if (checkUser) {
            return res.status(400).json({ statusCode: 400, message: "Username or email is already taken. Please try another." });
        }

        // If email changed, send verification code
        if (email !== currentUser.email) {
            const verificationCode = await sendEmail(email);
            if (!verificationCode) {
                return res.status(500).json({ statusCode: 500, message: "Failed to send verification code" });
            }

            req.session.emailCode = verificationCode;
            req.session.userInfo = req.body;
            req.session.role = currentUser.role;

            return res.status(201).json({
                statusCode: 201,
                message: "Verification code sent to your email. Please verify."
            });
        }

        // Perform update
        if (currentUser.userName) currentUser.userName = userName;
        if (currentUser.fullName) currentUser.fullName = fullName;
        if (currentUser.address) currentUser.address = address;
        if (currentUser.role === "law firm" && currentUser.totalLawyer) currentUser.totalLawyer = totalLawyer;

        await currentUser.save();

        return res.status(200).json({ statusCode: 200, message: "Profile updated successfully", data: currentUser });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "An error occurred while edit updating the profile.", error: error });
    }
};

// update profile in db
const updateProfile = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Verification code is required." });
        }

        // get user id from token
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized user" });
        }

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User does not exist" });
        }

        // get data from session
        const { emailCode, userInfo, role } = req.session;
        const isVerified = verifyEmail(code, emailCode);
        if (!userInfo || !isVerified) {
            return res.status(400).json({ statusCode: 400, message: "User data not found in session or verification incomplete. Please complete the edit profile process again." });
        }

        const { fullName, email, userName, totalLawyer, address } = userInfo;
        // Update the user profile
        user.userName = userName;
        if (role === "law firm") user.totalLawyer = totalLawyer;
        user.email = email;
        user.fullName = fullName;
        user.address = address;
        await user.save();

        // Clear session data after update
        req.session.emailCode = null;
        req.session.userInfo = null;
        req.session.role = null;

        return res.status(200).json({ statusCode: 200, message: "Profile updated successfully", data: user });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "An error occurred while verify and updating the profile.", error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        // get id from token
        const userId = req.user._id;

        // find the user in db
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User did not exist" })
        };

        return res.status(200).json({ statusCode: 200, data: user, message: "User get Successfully" })
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Something went wrong to get the User", error: error.message });
    }
}

// email pass
const email_for_Pass = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ statusCode: 400, message: "Email is required" });
        }

        const user = await User.findOne({ email }).select("-password");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User does not exist" });
        }

        const token = generate_passToken(user._id);

        // Save token in DB
        await PassReset.create({
            userId: user._id,
            token,
            used: false
        });

        const sendEmail = await pas_Email(user.email, token);
        if (!sendEmail) {
            return res.status(500).json({ statusCode: 500, message: "Something went wrong while sending the email" });
        }

        return res.status(200).json({ statusCode: 200, message: "Check your email inbox.", token: token });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Something went wrong", error: error.message });
    }
};

// update password in db
const update_pass = async (req, res) => {
    try {
        const { token } = req.params;
        const { new_pass } = req.body;

        // Check token in DB
        const resetTokenEntry = await PassReset.findOne({ token });
        if (!resetTokenEntry || resetTokenEntry.used) {
            return res.status(401).json({ statusCode: 400, message: "Token is invalid or already used" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Validate password
        const checkPass = verifyUserData(req.body)
        if (!checkPass) {
            return res.status(400).json({ statusCode: 400, message: checkPass.errors });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(new_pass, 10);
        const changePass = await User.findByIdAndUpdate(decoded?.id, { password: hashedPassword });
        if (!changePass) {
            return res.status(500).json({ statusCode: 500, message: "Something went wrong changing the password" });
        }

        // DELETE the token document from DB
        await PassReset.findByIdAndDelete(resetTokenEntry._id);

        return res.status(200).json({ statusCode: 200, message: "Your password was changed successfully." });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Something went wrong", error: error.message });
    }
};

// verify jwt
const userVerifyJWT = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "User did not found" })
        };
        return res.status(200).json({ statusCode: 200, message: "token is valid", data: true })
    } catch (error) {
        return res.status(500).json({ message: "internal server error to verify and edit the shop", error: error })
    }
}

export {
    valid_register, resendVerificationCode, register_user, login, logOut, changeAvatar, editProfile,
    updateProfile, getUser, email_for_Pass, update_pass, userVerifyJWT,
}