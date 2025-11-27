using System;
using System.Collections.Generic;
using System.Linq;
using RandomizerTools.Models;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    // Manages state and logic for the wheel of names tool
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

        // Adds an entry to the wheel
        public void AddEntry(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return;

            var entry = new WheelEntry(name);

            Entries.Add(entry);
        }

        // Removes an entry from the wheel
        public void RemoveEntry(WheelEntry entry)
        {
            if (entry == null)
                return;
            
            Entries.Remove(entry);
        }

        // Shuffles the entries list randomly
        public void ShuffleEntries()
        {
            if (Entries.Count > 1)
            {
                Entries = _randomizer.ShuffleList(Entries);
            }
        }

        // Sorts the entries alphabetically
        public void SortEntries()
        {
            if (Entries.Count > 1)
            {
                Entries = Entries.OrderBy(e => e.Name).ToList();
            }
        }

        // Removes all entries from the list
        public void ClearEntries()
        {
            Entries.Clear();
        }

        // Spins the wheel and selects a random winner
        public void SpinWheel()
        {
            if (Entries.Count == 0)
            {
                SelectedWinner = null;
                return;
            }

            SelectedWinner = _randomizer.GetRandomItem(Entries);
        }

        // Restores the list from storage
        public void RestoreState(List<WheelEntry>? loadedEntries)
        {
            if (loadedEntries != null)
            {
                Entries = loadedEntries;
            }
        }
    }
}