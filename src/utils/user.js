const users = [];

// add user , remove user , get user , get users in room

const addUser = ({id, userName , room}) => {
    //clean the data
    userName = userName.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if(!userName || !room){
        return {
            error  : 'UserName and Room required!'
        }
    }

    //check for exsting user
    const existingUser = users.find((user)=>user.userName == userName && user.room == room);

    //validate userName
    if(existingUser){
        return {
            error : 'User Name already in used'
        }
    }

    //store user data
    const user = { id , userName , room };
    users.push(user);

    return { user };

}

const removeUser = (id)=>{
    //this - solution 1
    // const findUser = users.find((user)=>user.id == id);

    // if(!findUser){
    //     return {
    //         error : 'User does not exists'
    //     }
    // }

    // users.pop(findUser);

    // or

    //this - solution 2
    const index = users.findIndex((user)=> user.id === id);

    if(index !== -1){
        return users.splice(index , 1)[0];
    }


}

const getUser = (id)=>{
    const user = users.find((user)=> user.id === id);

    if(!user){
        return {
            error : 'User dose not exists'
        }
    }

    return user;
}

const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase();
    const userArray = users.filter((user) => user.room === room);

    if(userArray.length == 0){
        return {
            error : 'No user checked in this room'
        }
    }

    return userArray;
}

module.exports = { addUser , removeUser , getUser , getUserInRoom};