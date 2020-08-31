using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebRTCRooms.Hubs
{
    public class RoomsHub: Hub
    {

        public async Task getrooms()
        {
            var rooms = Constants.Rooms;

            await Clients.Caller.SendAsync("allrooms", rooms);
        }

        public async Task addroom(string roomname)
        {
            if (Constants.Rooms.Any(m=>m.Name == roomname.ToLower()))
            {
                await Clients.Caller.SendAsync("error", "Room name already exists.");
                return;
            }

            Constants.Rooms.Add(new Room { Name=roomname.ToLower() });

            await Clients.Caller.SendAsync("allrooms", Constants.Rooms);
            await Clients.Caller.SendAsync("success", "Room added --- " + roomname);
        }

    }
}
