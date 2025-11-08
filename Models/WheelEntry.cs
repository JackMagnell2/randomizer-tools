using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RandomizerTools.Models
{
    /// <summary>
    /// Represents a single entry on the wheel of names
    /// </summary>
    public class WheelEntry
    {
        public string Name { get; set; }
        
        public WheelEntry() { }

        public WheelEntry(string name)
        {
            Name = name;
        }
    }
}