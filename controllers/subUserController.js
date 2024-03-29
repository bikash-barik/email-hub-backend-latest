import asyncHandler from "express-async-handler";
import Permission from "../models/permissionModel.js";
import SubUser from "../models/subUserModel.js";
import generateToken from "../utils/generateToken.js";

const authSubUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const subUser = await SubUser.findOne({ email });

  if (subUser && (await subUser.matchPassword(password))) {
    console.log("subuser",subUser);
    res.json({
      _id: subUser._id,
      name: subUser.name,
      sl_no: subUser.sl_no,
      gender: subUser.gender,
      date_of_birth: subUser.date_of_birth,
      pic: subUser.pic,
      office_phone: subUser.office_phone,
      mobile_no: subUser.mobile_no,
      email: subUser.email,
      username: subUser.username,
      privilege: subUser.privilege,
      status: subUser.status,
      Price:subUser.Price,
      SubcriptionDay:subUser.SubcriptionDay,
      Quote:subUser.Quote,
      applicationAccess1:subUser.applicationAccess1,
      applicationAccess2:subUser.applicationAccess2,
      applicationAccess3:subUser.applicationAccess3,
      applicationAccess4:subUser.applicationAccess4,
      token: generateToken(subUser._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Username or Password");
  }
});

const registerSubUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if(!user.name && user.privilege !== "superAdmin"){
    res.status(400);
    throw new Error("You are not authorized to do this");
  }
  const { name, sl_no, gender, date_of_birth, pic, office_phone, mobile_no, email, username, password, privilege, status,Price,SubcriptionDay,Quote } = req.body;

  const emailExists = await SubUser.findOne({ email });

  if (emailExists) {
    res.status(404);
    throw new Error("SubUser already exists");
  }
  const usernameExists = await SubUser.findOne({ username });

  if (usernameExists) {
    res.status(404);
    throw new Error("SubUser already exists");
  }

  const subUser = await SubUser.create({
    name,
    sl_no,
    gender,
    date_of_birth,
    pic,
    office_phone,
    mobile_no,
    email,
    username,
    password,
    privilege,
    status,
    Price,
    SubcriptionDay,
    Quote
  });

  if (subUser) {
    res.status(201).json({
      _id: subUser._id,
      name: subUser.name,
      sl_no: subUser.sl_no,
      gender: subUser.gender,
      date_of_birth: subUser.date_of_birth,
      pic: subUser.pic,
      office_phone: subUser.office_phone,
      mobile_no: subUser.mobile_no,
      email: subUser.email,
      username: subUser.username,
      privilege: subUser.privilege,
      status: subUser.status,
      applicationAccess1:subUser.applicationAccess1,
      applicationAccess2:subUser.applicationAccess2,
      applicationAccess3:subUser.applicationAccess3,
      applicationAccess4:subUser.applicationAccess4,
      Price:subUser.Price,
      SubcriptionDay:subUser.SubcriptionDay,
      Quote:subUser.Quote
    });
  } else {
    res.status(400);
    throw new Error("SubUser not found");
  }
});
const updateSubUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if(!user.name && user.privilege !== "superAdmin"){
    res.status(400);
    throw new Error("You are not authorized to do this");
  }
  const { name, sl_no, gender, date_of_birth, pic, office_phone, mobile_no, email, password, privilege, status,applicationAccess4,applicationAccess3,applicationAccess2,applicationAccess1,Price,SubcriptionDay,Quote } = req.body;
  console.log(req.body);
  const subUser = await SubUser.findById(req.params.id);
  console.log(subUser);
  if (subUser) {
    subUser.name = name || subUser.name;
    subUser.sl_no = sl_no || subUser.sl_no;
    subUser.gender = gender || subUser.gender;
    subUser.date_of_birth = date_of_birth || subUser.date_of_birth;
    subUser.pic = pic || subUser.pic;
    subUser.office_phone = office_phone || subUser.office_phone;
    subUser.mobile_no = mobile_no || subUser.mobile_no;
    subUser.email = email || subUser.email;
    subUser.privilege = privilege || subUser.privilege;
    subUser.status = status || subUser.status;
    subUser.applicationAccess1=applicationAccess1;
    subUser.applicationAccess2=applicationAccess2;
    subUser.applicationAccess3=applicationAccess3;
    subUser.applicationAccess4=applicationAccess4;
    subUser.Price= Price || subUser.Price;
    subUser.SubcriptionDay= SubcriptionDay  || subUser.SubcriptionDay;
    subUser.Quote= Quote || subUser.Quote;
    if(password){
      subUser.password = password;
    }
    const updatedSubUser = await subUser.save();
    res.status(200).json({
      _id: updatedSubUser._id,
      name: updatedSubUser.name,
      sl_no: updatedSubUser.sl_no,
      gender: updatedSubUser.gender,
      date_of_birth: updatedSubUser.date_of_birth,
      pic: updatedSubUser.pic,
      office_phone: updatedSubUser.office_phone,
      mobile_no: updatedSubUser.mobile_no,
      email: updatedSubUser.email,
      privilege: updatedSubUser.privilege,
      status: updatedSubUser.status,
      applicationAccess1:updatedSubUser.applicationAccess1,
      applicationAccess2:updatedSubUser.applicationAccess2,
      applicationAccess3:updatedSubUser.applicationAccess3,
      applicationAccess4:updatedSubUser.applicationAccess4,
      quote:updatedSubUser.Quote,
      price:updatedSubUser.Price,
      subscription_day:updatedSubUser.SubcriptionDay,
      token: generateToken(updatedSubUser._id),
    });
  } else {
    res.status(400);
    throw new Error("SubUser not found");
  }
});

const toggleStatus = asyncHandler(async (req, res) => {
  const user = req.user;
  if(!user.name && user.privilege !== "superAdmin"){
    res.status(400);
    throw new Error("You are not authorized to do this");
  }
  const subUser = await SubUser.findById(req.params.id);

  if (subUser) {
    if (subUser.status === "active") {
      subUser.status = "inactive";
    } else {
      subUser.status = "active";
    }
    const updatedSubUser = await subUser.save();
    res.status(200).json({
      _id: updatedSubUser._id,
      status: updatedSubUser.status,
    });
  } else {
    res.status(400);
    throw new Error("SubUser not found");
  }
});


const getSubUsers = asyncHandler(async (req, res) => {
  const subUsers = await SubUser.find();
  res.json(subUsers);
});



const DeleteSubUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if(!user.name && user.privilege !== "superAdmin"){
    const permission = await Permission.find({
      subUser: user._id,
      category: 'application',
      feature: 'subUser'
    });
    
    if(permission.length === 0){
      res.status(400);
      throw new Error("You are not authorized to do this");
    }
    if(!(permission[0].managerRights === true)){
      res.status(400);
      throw new Error("You are not authorized to do this");
    }
  }
  const subUser = await SubUser.findById(req.params.id);

  if (subUser && subUser.user && subUser.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You can't perform this action");
  }

  if (subUser) {
    await subUser.remove();
    res.json({ message: "SubUser Removed" });
  } else {
    res.status(404);
    throw new Error("SubUser not Found");
  }
});


const getSubUserById = asyncHandler(async (req, res) => {
  const subUser = await SubUser.findById(req.params.id);

  if (subUser) {
    res.json(subUser);
  } else {
    res.status(404).json({ message: "subUser not found" });
  }

  res.json(subUser);
});

export {getSubUserById,getSubUsers, authSubUser, registerSubUser, updateSubUserProfile, toggleStatus ,DeleteSubUser};