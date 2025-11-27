using System;
using System.Collections.Generic;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state for the dice tool
    /// </summary>
    public class DiceViewModel
    {
        private readonly RandomizerService _randomizer;

        private List<int> _pendingResults = new();

        public int DiceCount { get; set; } = 1;
        public List<int> CurrentValues { get; private set; } = new();
        public List<string> History { get; private set; } = new();
        public int TotalSum => CurrentValues.Sum();

        public DiceViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
            CurrentValues.Add(1);
        }

        /// <summary>
        /// Sets the number of dice to roll
        /// </summary>
        public void SetDiceCount(int count)
        {
            if (count < 1) count = 1;
            if (count > 6) count = 6;

            DiceCount = count;

            while (CurrentValues.Count < DiceCount) CurrentValues.Add(1);
            while (CurrentValues.Count > DiceCount) CurrentValues.RemoveAt(CurrentValues.Count - 1);
        }

        /// <summary>
        /// Calculates random values for all dice
        /// </summary>
        public List<int> CalculateRoll()
        {
            _pendingResults.Clear();
            for (int i = 0; i < DiceCount; i++)
            {
                _pendingResults.Add(_randomizer.RollDice(6));
            }

            return _pendingResults;
        }

        /// <summary>
        /// Commits the pending results to history after animation
        /// </summary>
        public void CommitResult()
        {
            CurrentValues = new List<int>(_pendingResults);

            string historyEntry = $"{string.Join(" + ", CurrentValues)} = {TotalSum}";
            History.Insert(0, historyEntry);

            if (History.Count > 10)
                History.RemoveAt(10);
        }

        /// <summary>
        /// Restores state from local storage
        /// </summary>
        public void RestoreState(int diceCount, List<int> currentValues, List<string> history)
        {
            SetDiceCount(diceCount);
            if (currentValues != null && currentValues.Count == DiceCount)
            {
                CurrentValues = currentValues;
            }

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