using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebRTCRooms.Pages
{
    public class RoomModel : PageModel
    {
        public string RoomName { get; set; }

        public IActionResult OnGet(string n)
        {
            if (string.IsNullOrWhiteSpace(n))
            {
                return RedirectToPage("/Index");
            }
            else
            {
                RoomName = n;
                return Page();
            }
        }
    }
}
