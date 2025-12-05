using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state for the list shuffler tool
    /// </summary>
    public class ListShufflerViewModel
    {
        private readonly RandomizerService _randomizer;

        public List<string> Items { get; private set; } = new();

        public List<string> ShuffledResult { get; private set; } = new();

        public ListShufflerViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
        }

        /// <summary>
        /// Adds a clean item to the list
        /// </summary>
        public void AddItem(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return;

            var split = input.Split(new[] { ',', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var item in split)
            {
                var clean = item.Trim();
                if (!string.IsNullOrWhiteSpace(clean)) Items.Add(clean);
            }
        }

        /// <summary>
        /// Removes item from list
        /// </summary>
        public void RemoveItem(string item) => Items.Remove(item);

        /// <summary>
        /// Clears items
        /// </summary>
        public void Clear()
        {
            Items.Clear();
            ShuffledResult.Clear();
        }

        /// <summary>
        /// Shuffles list
        /// </summary>
        public void Shuffle()
        {
            if (Items.Count < 2) return;
            ShuffledResult = _randomizer.ShuffleList(Items);
        }

        /// <summary>
        /// Persistence
        /// </summary>
        public void RestoreState(List<string>? items, List<string>? result)
        {
            Items = items ?? new List<string>();
            ShuffledResult = result ?? new List<string>();
        }
    }
}