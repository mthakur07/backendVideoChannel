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

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body
    console.log("userName: ", userName)
    console.log("fullName: ", fullName)
    console.log("email: ", email);
    console.log("password: ", password)


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
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
export { registerUser };