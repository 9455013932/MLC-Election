import jwt from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { queryDatabase } from '../utils/queryDatabase.js';

// SELECT U.name, U.mobile1, COUNT(U.userid) AS user_count
// FROM voterlist
// INNER JOIN usersadminformsdata AS U ON voterlist.SBy = U.userid
// WHERE voterlist.SDate > '2017-07-01' 
// GROUP BY U.userid, U.name, U.mobile1;



const voterList = asyncHandler(async (req, res) => {

    const { WBId } = req.body;

    if (!WBId) {
        return res.status(400).json({ error: 'WBId parameter is required' });
    }

    try {
        const results = await queryDatabase(
            `SELECT voterlist.Id, PacketNo, EFName, HFName, ELName, HLName, RType, ERFName, HRFName, 
            ERLName, HRLName, CasteId, caste.ECaste, Qualification, Occupation, Age, 
            DATE_FORMAT(DOB, '%d/%m/%Y') as DOB, Sex, MNo, MNo2, AadharNo, VIdNo, GCYear, 
             AreaVill.EAreaVill ,AreaVill.HAreaVill, AreaId, TehId, CounId, VSId, WBId, ChkBlkId, HNo, Landmark, Image, IdProof, Degree 
            FROM voterlist 
            LEFT JOIN caste ON CasteId = caste.ID 
            LEFT JOIN AreaVill ON AreaId= AreaVill.Id
            WHERE WBId = ?`, 
            [WBId]
        );

        return res.status(201).json(
            new ApiResponse(200, results, " details fetched successfully")
        )
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});


const NoMobvoterList = asyncHandler(async (req, res) => {

    const { WBId } = req.body;

    if (!WBId) {
        return res.status(400).json({ error: 'WBId parameter is required' });
    }

    try {
        const results = await queryDatabase(
            `SELECT Id, RegNo, PacketNo, EFName, HFName, ELName, HLName, RType, ERFName, HRFName, 
            ERLName, HRLName, CasteId, caste.ECaste, Qualification, Occupation, Age, 
            DATE_FORMAT(DOB, '%d/%m/%Y') as DOB, Sex, MNo, MNo2, AadharNo, VIdNo, GCYear, 
            AreaVill.EAreaVill, AreaId, TehId, CounId, VSId, WBId, ChkBlkId, HNo, Landmark, Image, IdProof, Degree 
            FROM voterlist 
            LEFT JOIN caste ON CasteId = caste.ID 
            LEFT JOIN AreaVill ON AreaId= AreaVill.Id
            WHERE WBId = ? AND MNo = ?`, 
            [WBId, ISNULL]
        );

        return res.json(results);
    } catch (error) {
        console.error('Database query error', error);
        return res.status(500).json({ error: 'A database error occurred.' });
    }
});


export {voterList}