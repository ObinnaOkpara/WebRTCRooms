using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebRTCRooms.Hubs
{
    public class ChatHub: Hub
    {
        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var curId = Context.ConnectionId;
            var user = Constants.UserMappings[curId];
            var room = user.Room;
            var userid = user.UserId;

            Constants.UserMappings.Remove(curId);
            var otherUserConIds = Constants.UserMappings.Values.Where(m => m.Room == room).Select(n => n.ConnId);

            await Clients.Clients(otherUserConIds.ToList()).SendAsync("userdisconnected", userid);

            //await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task joinroom(string roomname)
        {
            var room = Constants.Rooms.FirstOrDefault(m => m.Name == roomname.ToLower());
            if (room == null)
            {
                await Clients.Caller.SendAsync("error", "Room name not found!");
                return;
            }

            var curId = Context.ConnectionId;
            var userId = Guid.NewGuid().ToString();
            Constants.UserMappings.AddOrUpdate(curId, new UserObj
            {
                ConnId = curId,
                UserId = userId,
                Room = room.Name,
            });

            if (room.Count > 1)
            {
                await Clients.Caller.SendAsync("notfirstperson", userId, 
                    Constants.UserMappings.Values.Where(n=>n.Room== roomname).Select(m=> m.UserId));
            }
            else
            {
                await Clients.Caller.SendAsync("firstperson", userId);
            }

            Console.WriteLine($"\n room: {roomname} \n conId : {curId} \n UserId : {userId}");
        }

        public async Task startcall(string userId, string connectionData)
        {
            var curId = Context.ConnectionId;
            
            var caller = Constants.UserMappings[curId];
            var callee = Constants.UserMappings.Values.FirstOrDefault(m => m.UserId == userId);
            if (caller != null && callee != null)
            {
                await Clients.Client(callee.ConnId).SendAsync("answercall", caller.UserId, connectionData);
                Console.WriteLine("Starting call " + userId);
            }
            else
            {
                await Clients.Caller.SendAsync("error", "User not found!");
                Console.WriteLine("User not found " + userId);
                return;
            }
        }

        public async Task answeringcall(string userid, string connectionData)
        {
            var curId = Context.ConnectionId;

            var callee = Constants.UserMappings[curId];
            var caller = Constants.UserMappings.Values.FirstOrDefault(m => m.UserId == userid);
            if (caller != null && callee != null)
            {
                await Clients.Client(caller.ConnId).SendAsync("receivecall", callee.UserId, connectionData);
                Console.WriteLine("Answering call " + userid);
            }
            else
            {
                await Clients.Caller.SendAsync("error", "User not found!");
                Console.WriteLine("User not found " + userid);
            }
        }

    }
}
