// import {asyncHandler} from 'asyncHandler';

// const registerUser = asyncHandler(async (req, res) => {
//     res.status(200).json({
//         message: "ok"
//     })
// })

// export {registerUser}


import { asyncHandler } from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok, We are running at port :4000 "
    });
});

export { registerUser };
