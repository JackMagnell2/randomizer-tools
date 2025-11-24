using System;
using System.Collections.Generic;
using RandomizerTools.Models;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state and logic for the wheel of names tool
    /// </summary>
    public class WheelOfNamesViewModel
    {
        private readonly RandomizerService _randomizer;

        public List<WheelEntry> Entries { get; set; }

        public WheelOfNamesViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
            Entries = new List<WheelEntry>();
        }
    }
}