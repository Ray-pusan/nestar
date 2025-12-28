import { Schema } from "mongoose";
import { MemberAuthType, MemberStatus, MemberType } from "../libs/enums/member.enum";

const MemberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.USER,
    },

    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE,
    },

    memberAuthType: {
        type: String,
        enum: MemberAuthType,
        default: MemberAuthType.PHONE,
    },

    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        require: true,
    },

    memberNick: {
        type: String,
        index: { unique: true, sparse: true },
        require: true,
    },

    memberPassword: {
        type: String,
        select: false,
        require: true
    },

    memberFullName: {
        type: String,
    },

    memberImage: {
        type: String,
        default: "",
    },

    memberAddress: {
        type: String,
    },

    memberDesc: {
        type: String,
    },

    memberProperties: {
        type: Number,
        default: 0,
    },

    memberArticles: {
        type: String,
        default: 0,
    },

    memberFollowers: {
        type: String,
        default: 0,
    },

    memberFollowings: {
        type: String,
        default: 0,
    },

    memberPoints: {
        type: String,
        default: 0,
    },

    memberLikes: {
        type: String,
        default: 0,
    },

    memberViews: {
        type: String,
        default: 0,
    },

    memberComments: {
        type: String,
        default: 0,
    },

    memberRank: {
        type: String,
        default: 0,
    },

    memberWarnings: {
        type: String,
        default: 0,
    },

    memberBlocks: {
        type: String,
        default: 0,
    },

    deletedAt: {
        type: Date,
    }

}, { timestamps: true, collection: "members" });

export default MemberSchema;