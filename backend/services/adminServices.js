import { AdminError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import { getDifferences, validateUser, getConflictingFields } from "../utils/utils.js";

export async function editUser(userid, { data }) {
    const user = await userRepository.findById(userid);
    await validateUser(user, AdminError);
    const conflictingUsers = await userRepository.findConflicts({ email: data.email, phone: data.phone });
    const conflicts = getConflictingFields(conflictingUsers, userid, data);
    if (conflicts.length) {
        throw new AdminError({
            message: `Os seguintes campos já pertencem a outro usuário: ${conflicts.join(", ")}`,
            status: 409,
            code: "DATA_CONFLICT"
        });
    }   
    const updateuser = await userRepository.update(user.id, data);
    return updateuser;
    }

export async function removeUser(requesterid, userid) {
    const requester = await userRepository.findById(requesterid);
    await validateUser(requester, AdminError);
    const user = await userRepository.findById(userid);
    await validateUser(user, AdminError);
    if (user.id === requester.id) {
        throw new AdminError({ 
        message: "Você não pode apagar a si mesmo",
        status: 400,
        code: "BAD_REQUEST" });
    }
    return await userRepository.deletebyId(user.id);
    }
