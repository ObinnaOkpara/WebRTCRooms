using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebRTCRooms.Hubs
{
    public class RoomsHub: Hub
    {

        //private IHubContext<ChatHub> ChatHubContext { get; set; }

        //public RoomsHub(IHubContext<ChatHub> hubcontext)
        //{
        //    ChatHubContext = hubcontext;
        //}

        public async Task getrooms()
        {
            var rooms = Constants.Rooms;

            await Clients.Caller.SendAsync("allrooms", rooms);
        }

        public async Task addroom(string roomname)
        {
            if (Constants.Rooms.Any(m => m.Name == roomname.ToLower()))
            {
                await Clients.Caller.SendAsync("error", "Room name already exists.");
                return;
            }

            Constants.Rooms.Add(new Room { Name = roomname.ToLower() });

            await Clients.All.SendAsync("allrooms", Constants.Rooms);
            await Clients.Caller.SendAsync("success", "Room added --- " + roomname);
        }

        public async Task closeroom(string roomname)
        {
            var room = Constants.Rooms.FirstOrDefault(m=> m.Name == roomname.ToLower());

            if (room == null) await Clients.Caller.SendAsync("error", "Room not found.");

            if (room.Count > 0)
            {
                await Clients.Caller.SendAsync("error", "Can not close rooms with participants.");
            }
            else 
            {
                Constants.Rooms.Remove(room);
                await Clients.All.SendAsync("allrooms", Constants.Rooms);

                await Clients.Caller.SendAsync("success", "Room removed.");
            }
        }

    }
}
