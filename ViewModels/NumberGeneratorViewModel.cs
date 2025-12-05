using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state for the number generator tool
    /// </summary>
    public class NumberGeneratorViewModel
    {
        private readonly RandomizerService _randomizer;

        public int MinValue { get; set; } = 1;
        public int MaxValue { get; set; } = 100;
        public int Count { get; set; } = 1;
        public bool AllowDuplicates { get; set; } = false;
        public bool SortResult { get; set; } = false;

        public List<int> CurrentResults { get; private set; } = new();
        public List<string> History { get; private set; } = new();

        public NumberGeneratorViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
        }

        /// <summary>
        /// Validates input and generates random numbers
        /// </summary>
        public List<int> Generate()
        {
            if (Count < 1) Count = 1;
            if (Count > 5) Count = 5;

            if (MinValue > MaxValue) (MinValue, MaxValue) = (MaxValue, MinValue);

            if (MinValue < -10000000) MinValue = -10000000;
            if (MaxValue > 10000000) MaxValue = 10000000;

            var results = _randomizer.GetRandomNumbers(MinValue, MaxValue, Count, !AllowDuplicates);

            if (SortResult)
            {
                results.Sort();
            }

            return results;
        }

        /// <summary>
        /// Commits results to history and state
        /// </summary>
        public void CommitResult(List<int> finalResults)
        {
            CurrentResults = finalResults;

            string entry = string.Join(", ", finalResults);
            History.Insert(0, entry);

            if (History.Count > 15) History.RemoveAt(15);
        }

        /// <summary>
        /// Restores state from local storage
        /// </summary>
        public void RestoreState(int min, int max, int count, bool dupe, bool sort, List<string> history)
        {
            MinValue = min;
            MaxValue = max;
            Count = count;
            AllowDuplicates = dupe;
            SortResult = sort;
            History = history ?? new List<string>();
        }

        /// <summary>
        /// Clears history
        /// </summary>
        public void ClearHistory()
        {
            History.Clear();
        }
    }
}
