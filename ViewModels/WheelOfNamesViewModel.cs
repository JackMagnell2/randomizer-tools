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

        public List<WheelEntry> Entries { get; private set; }

        public WheelEntry? SelectedWinner { get; private set; }

        public WheelOfNamesViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
            Entries = new List<WheelEntry>();
        }

        /// <summary>
        /// Adds an entry to the wheel
        /// </summary>
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
        public void RemoveEntry(WheelEntry entry)
        {
            if (entry == null)
                return;
            
            Entries.Remove(entry);
        }

        /// <summary>
        /// Shuffles the entries list randomly
        /// </summary>
        public void ShuffleEntries()
        {
            if (Entries.Count > 1)
            {
                Entries = _randomizer.ShuffleList(Entries);
            }
        }

        /// <summary>
        /// Sorts the entries alphabetically
        /// </summary>
        public void SortEntries()
        {
            if (Entries.Count > 1)
            {
                Entries = Entries.OrderBy(e => e.Name).ToList();
            }
        }

        /// <summary>
        /// Removes all entries from the list
        /// </summary>
        public void ClearEntries()
        {
            Entries.Clear();
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

        /// <summary>
        /// Restores the list from storage
        /// </summary>
        public void RestoreState(List<WheelEntry>? loadedEntries)
        {
            if (loadedEntries != null)
            {
                Entries = loadedEntries;
            }
        }
    }
}
