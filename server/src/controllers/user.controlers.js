import jwt from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { queryDatabase } from '../utils/queryDatabase.js';

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY   // expiresIn is in seconds
        });
};

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        console.log(req.cookies.token);
        const userRole = req.user.role; // Assuming user role is stored in req.user.role
        if (userRole === requiredRole) {
            next();
        } else {
            res.status(403).json({ message: "You do not have permission to access this resource" });
        }
    };
};


const loginUser = asyncHandler(async (req, res) => {
    const { userid, password } = req.body;
    if (!userid || !password) {
        throw new ApiError(400, "UserId or password is required");
    }

    try {
        const results = await queryDatabase('SELECT * FROM userlogin WHERE userid = ?', [userid]);
        if (results.length > 0) {
            const user = results[0];
            // Check if the password matches
            if (password === user.password) {
                const tokenPayload = {
                    userid: user.userid,
                    role: user.role,
                    name: user.name
                };

                const token = generateToken(tokenPayload); // Generate JWT token

                console.log('JWT token generated');

                const options = {
                    httpOnly: false, 
                    secure: false, // Should be true in production
                    maxAge: 60 * 60 * 1000, 
                    sameSite: 'Lax', 
                    path: '/', 
                };

                // Create a sanitized user object without sensitive information
                const sanitizedUser = {
                    userid: user.userid,
                    role: user.role,
                    name: user.name,
                    DId: user.DId
                    // Add any other fields you want to expose
                };

                return res
                    .status(200)
                    .cookie("token", token, options)
                    .json(
                        new ApiResponse(
                            200,
                            {
                                user: sanitizedUser, 
                                token
                            },
                            "User logged in successfully"
                        )
                    );
            } else {
                throw new ApiError(401, "Invalid user credentials");
            }
        } else {
            throw new ApiError(401, "Invalid user credentials");
        }
    } catch (error) {
        console.error('Database query error', error);
        return res.status(500).send('A database error occurred, please try again later.');
    }
});

const DistrictDetails = asyncHandler(async(req, res)=>{
    try {
        const result = await queryDatabase('SELECT Id, EDistrict FROM district ')
        return res.json(result);
    } catch (error) {
        return res.status(500).send('A database error occurred.');
    }


});

const submitDetails = asyncHandler(async (req, res) => {
    const { userId, password, DId, name, mobile1, mobile2, email, address, permission, role, loginUserId } = req.body;

    if (!userId || !password || !DId || !name || !mobile1 || !role || !loginUserId) {
        throw new ApiError(400, "Please enter all details!");
    }

    const currentDate = new Date();
    const SDate = currentDate.toISOString(); 

    try {
        await queryDatabase(
            'INSERT INTO userlogin (userId, password,DId, name, mobile1, mobile2, email, address, permissionAccess, role, SBy, SDate) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, password,DId, name, mobile1, mobile2, email, address, permission, role, loginUserId, SDate]
        );

        const createdUser = {
            userId,
            name,
            DId,
            mobile1,
            mobile2,
            email,
            address,
            permission,
            role
        };

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User details submitted successfully")
        );
    } catch (error) {
        console.error('Database query error', error);
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});

const hariom = asyncHandler(async (req, res) => {
    const { role, loginUserId } = req.body;
    try {
        const results = await queryDatabase('SELECT * FROM userlogin WHERE role = ? AND SBy= ?', [role, loginUserId]);  // no need to destructure
        return res.json(results); 
    } catch (error) {
        
        return res.status(500).send('A database error occurred.');
    }
 
});


const changePassword = asyncHandler(async (req, res) => {
    const { userId, password, confirmPassword } = req.body;

    console.log(req.body);
    if (!userId || !password || !confirmPassword) {
        throw new ApiError(400, "Please enter all details!")
    }

    try {
        await queryDatabase(
            'UPDATE userlogin SET userId = ?, password = ? WHERE userId = ?',
            [userId, password, userId]
        );


        return res.status(201).json(
            new ApiResponse(200, "User details submitted successfully")
        );
    } catch (error) {
        console.error('Database query error', error);
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});

const AddDistrict = asyncHandler(async (req, res) => {
    const { DistCode, EDistrict, HDistrict, ESGraduate, HSGraduate } = req.body;
    if (!DistCode || !EDistrict || !HDistrict || !ESGraduate || !HSGraduate) {
        throw new ApiError(400, "Please enter all details!")
    }

    try {
        await queryDatabase(
            'INSERT INTO district (DistCode, EDistrict, HDistrict, ESGraduate, HSGraduate) VALUES (?, ?, ?, ?, ?)',
            [DistCode, EDistrict, HDistrict, ESGraduate, HSGraduate]
        );

        const createdDistrict = {
            DistCode, EDistrict, HDistrict, ESGraduate, HSGraduate
        };

        return res.status(201).json(
            new ApiResponse(200, createdDistrict, "District details submitted successfully")
        );
    } catch (error) {
        console.error('Database query error', error);
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});

const GetDistrictDetails = asyncHandler(async (req, res) => {
    try {
        const results = await queryDatabase('SELECT * FROM district');
        return res.json(results);
    } catch (error) {
        console.error('Database query error', error);
        return res.status(500).send('A database error occurred.');
    }
});

const UpdateDistrictDetail = asyncHandler(async (req, res) => {
    const { Id, EName, HName, } = req.body;
    if (!Id || !EName || !HName) {
        throw new ApiError(400, "Please enter all details!")
    }

    try {
        await queryDatabase(
            'UPDATE district SET EName= ?, HName= ? WHERE Id = ?',
            [EName, HName, Id]
        );

        const updatedTehsil = {
            Id, EName, HName
        };

        return res.status(201).json(
            new ApiResponse(200, updatedTehsil, "Tehsil details Updated successfully")
        );
    } catch (error) {
        console.error('Database query error', error);
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});

const DeleteDistrictDetail = asyncHandler(async (req, res) => {
    const { DistCode } = req.body;
    // if (!DistCode || !EDistrict || !HDistrict || !ESGraduate || !HSGraduate) {
    //     throw new ApiError(400, "Please enter all details!")
    // }

    try {
        await queryDatabase(
            'DELETE FROM district WHERE DistCode= ?',
            [DistCode]
        );


        return res.status(201).json(
            new ApiResponse(200, "District details Deleted successfully")
        );
    } catch (error) {
        console.error('Database query error', error);
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});

const logoutuser = async (req, res) => {
    try {
        res.clearCookie('token')
        res.status(200).send({ success: true, message: 'User logout' })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Something wrong in logout controller'
        })
    }
}


export { loginUser, DistrictDetails,submitDetails, hariom, changePassword, AddDistrict, GetDistrictDetails, logoutuser, UpdateDistrictDetail, DeleteDistrictDetail, checkRole, }



