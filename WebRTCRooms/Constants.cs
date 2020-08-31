using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebRTCRooms
{

    public static class Constants
    {
        public static Dictionary<string, UserObj> UserMappings = new Dictionary<string, UserObj>();

        public static void AddOrUpdate(this Dictionary<string, UserObj> dict, string key, UserObj val)
        {
            if (dict.ContainsKey(key))
            {
                dict[key] = val;
            }
            else
            {
                dict.Add(key, val);
            }
        }


        public static List<Room> Rooms = new List<Room>();

    }

    public class UserObj
    {
        public string ConnId { get; set; }
        public string UserId { get; set; }
        public string Room { get; set; }
        public string webrtcData { get; set; }
    }

    public class Room
    {
        public string Name { get; set; }
        public int Count { get {
                return string.IsNullOrWhiteSpace(Name) ? 
                     0 : Constants.UserMappings.Values.Count(m => m.Room == Name);
                    } }
    }
}
