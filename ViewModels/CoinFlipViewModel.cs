using System;
using System.Collections.Generic;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state for the coin flip tool
    /// </summary>
    public class CoinFlipViewModel
    {
        private readonly RandomizerService _randomizer;
        
        private bool _pendingIsHeads; 

        public bool IsHeads { get; private set; } = true;
        public int HeadsCount { get; private set; }
        public int TailsCount { get; private set; }
        public List<string> History { get; private set; } = new List<string>();

        public CoinFlipViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
        }

        /// <summary>
        /// Determines result without updating stats
        /// </summary>
        /// <returns></returns>
        public bool CalculateFlip()
        {
            _pendingIsHeads = _randomizer.FlipCoin();
            return _pendingIsHeads;
        }

        /// <summary>
        /// Updates history and counters
        /// </summary>
        public void CommitResult()
        {
            IsHeads = _pendingIsHeads;

            if (IsHeads) HeadsCount++;
            else TailsCount++;

            History.Insert(0, IsHeads ? "Heads" : "Tails");
            
            if (History.Count > 10) 
                History.RemoveAt(10);
        }

        /// <summary>
        /// Resets all game data
        /// </summary>
        public void ResetStats()
        {
            HeadsCount = 0;
            TailsCount = 0;
            History.Clear();
        }

        /// <summary>
        /// Restores state from persistence
        /// </summary>
        public void RestoreState(int heads, int tails, List<string> history, bool lastIsHeads)
        {
            HeadsCount = heads;
            TailsCount = tails;
            History = history ?? new List<string>();
            IsHeads = lastIsHeads;
        }
    }
}