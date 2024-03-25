import {asyncHandler} from 'asyncHandler';

const registerUser = asyncHandler(async ()=>{
    resizeBy.status(200).json({
        message: "ok"
    })
})

export {registerUser}