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

        public WheelEntry? SelectedWinner { get; set;}

        public WheelOfNamesViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
            Entries = new List<WheelEntry>();
        }

        /// <summary>
        /// Adds an entry to the wheel
        /// </summary>
        /// <param name="name">The name of the entry</param>
        public void AddEntry(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return;

            var entry = new WheelEntry(name);

            Entries.Add(entry);
        }

        /// <summary>
        /// Removes an entry from the wheel
        /// </summary>
        /// <param name="entry">The entry to be removed</param>
        public void RemoveEntry(WheelEntry entry)
        {
            if (entry == null)
                return;
            
            Entries.Remove(entry);
        }

        /// <summary>
        /// Spins the wheel and selects a random winner
        /// </summary>
        public void SpinWheel()
        {
            if (Entries.Count == 0)
            {
                SelectedWinner = null;
                return;
            }

            SelectedWinner = _randomizer.GetRandomItem(Entries);
        }
    }
}