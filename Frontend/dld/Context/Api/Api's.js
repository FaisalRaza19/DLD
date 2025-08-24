const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL

export const userAuth = {
    register: `${backendUrl}/user/register`,
    verify_register: `${backendUrl}/user/verify-register`,
    resendCode: `${backendUrl}/user/resend-code`,
    login: `${backendUrl}/user/login`,
    logOut: `${backendUrl}/user/logOut`,
    getUser: `${backendUrl}/user/get-user`,
    updateAvatar: `${backendUrl}/user/change-avatar`,
    verifyJWT: `${backendUrl}/user/verify-jwt`,
    editProfile: `${backendUrl}/user/edit-profile`,
    verify_edit: `${backendUrl}/user/verify-profile`,
    // forget pass
    email_pass: `${backendUrl}/user/email-pass`,
    update_pass: `${backendUrl}/user/change-pass`
}

export const cases = {
    createCase: `${backendUrl}/case/createCase`,
    editCase: `${backendUrl}/case/editCase`,// params id required
    delCase: `${backendUrl}/case/delCase`,
    changeStatus: `${backendUrl}/case/updateStatus`,
    getCases: `${backendUrl}/case/getCases`,
    getCase: `${backendUrl}/case/getCase`,
    restoreDocs: `${backendUrl}/case/restoreDocs`
}

export const Clients = {
    getClients: `${backendUrl}/subUser/getClient`,
    createClient: `${backendUrl}/subUser/createClient`,
    editClient: `${backendUrl}/subUser/editClient`,
    delClient: `${backendUrl}/subUser/delClient`,
}

export const Lawyers = {
    getLawyers: `${backendUrl}/subUser/getLawyer`,
    createLawyer: `${backendUrl}/subUser/createLawyer`,
    editLawyer: `${backendUrl}/subUser/editLawyer`,
    delLawyer: `${backendUrl}/subUser/delLawyer`
}


export const Hearings = {
    getHearings: `${backendUrl}/hearings/getCaseHearings`,
    addHearing: `${backendUrl}/hearings/createHearing`,
    editHearing: `${backendUrl}/hearings/editHearing`,
    delHearing: `${backendUrl}/hearings/deleteHearing`,
    // New notification endpoints
    getNotifications: `${backendUrl}/hearings/getNotifications`,
    markNotificationRead: `${backendUrl}/hearings/markNotificationRead`,
    deleteNotification: `${backendUrl}/hearings/deleteNotification`,
}