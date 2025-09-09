export const isAdmin =  (user) =>
{
    return user.userType === "A";

}


export const isEmployee =  (user) =>
{
    return user.userType === "F";
}


export const isClient =  (user) =>
{
    return user.userType === "C";
}


export const isOnProject = (user, project) =>
{
    return project.clientID === user.personID || project.employeeID === "users/"+user.id;
}

export const isOnNotification = (user, notification) =>
{
    return notification.senderID === "users/"+user.id || notification.receiverID === "users/"+user.id;
}


