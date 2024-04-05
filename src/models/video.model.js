import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFiles: {
            type: String, // cloudenary url
            required: true,
        },
        thumbnail:{
            type: String, // cloudenary url
            required: true,
        },
        title: {
            type: String, // cloudenary url
            required: true,
        },
        desciptions: {
            type: String, // cloudenary url
            required: true,
        },
        duration: {
            type: Number, 
            required: true
        },
        views: {
            typeof: Number,  
            required: 0
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        videoOwner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true,
    })
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema) 