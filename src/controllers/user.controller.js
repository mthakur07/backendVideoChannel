// // for testing Only 
// import { asyncHandler } from '../utils/asyncHandler.js';

// const registerUser = asyncHandler(async (req, res) => {
//     res.status(200).json({
//         message: "ok, We are running at port :4000 "
//     });
// });

// export { registerUser };


// How to make register form... Follow these steps : 

// Get user details 
// validatiion - data not empty 
// Check if already exist with username and email 
// check for profile photo and avatar
// uplaod file to cloudery 
// Create user object -- create entery inn database 
// remove password and refresh token fields from response 
// check for user creation 
// data url/json se Ya form kisi bhi tarike se aa sakte hai

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
//import { jwt } from "../utils/jwt.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

    } catch (error) {
        throw new ApiError("Something went wrong while generating access & refresh token ")
    }

}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body
    // console.log("userName: ", userName)
    // console.log("fullName: ", fullName)
    // console.log("email: ", email);
    // console.log("password: ", password)
    // console.log(req.body) // All these parameters are given 

    if ([fullName, email, userName, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All field are required")

    }
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, " User with email or username already exists")

    }

    //console.log(req.files) // Show all details about files 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.
        coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, " Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, " avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, " Something went wrong while registed user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered")
    )
})

// Todos for user 
// req body se data 
// username or Email
// find the user by
// authenticate with password
// generate access token and refresh token
// send cookies 

const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body
    //console.log(`email - ${email}, password - ${password}`);
    if (!(userName || email)) {
        throw new ApiError(400, "username or email required")
    }
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        // throw new ApiError(401, "Authentication failed");
        throw new ApiError(401, "Authentication failed");

    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,   // You can see in frontend but you can not change
        secure: true
    }
    return res
        .status(200)
        .cookie("access_token", accessToken, options)
        .cookie("refresh_token", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully"
            )
        )
})
const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if (incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }
   try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.ACCESS_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401, "invalid refresh token")
    }
    if(incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "refresh token is expired or already used") 
    }
    const options = {
        httpOnly: true,
        secure: true
    }
   const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    return res 
    .status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", newRefreshToken, options)
    .json(
        new ApiResponse(
            200, {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )
    )

   } catch (error) {
    
   }

})

export {
    registerUser,
    loginUser,
    logoutUser
};