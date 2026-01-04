import { Field, InputType } from "@nestjs/graphql";
import { ViewGroup } from "../../enums/view.enum";
import { ObjectId } from "mongoose";
import { IsNotEmpty } from "class-validator";

@InputType()
export class ViewInput {
    @IsNotEmpty()
    @Field(() => String)
    memberId: ObjectId;
    
    @IsNotEmpty()
    @Field(() => String)
    viewRefId: ObjectId;
    
    @IsNotEmpty()
    @Field(() => ViewGroup)
    viewGroup: ViewGroup;
}