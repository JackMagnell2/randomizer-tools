using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state and logic for the coin flip tool
    /// </summary>
    public class CoinFlipViewModel
    {
        private readonly RandomizerService _randomizer;

        public bool IsHeads { get; private set; } = true;

        public bool IsFlipping { get; private set; } = false;

        public int HeadsCount { get; private set; }

        public int TailsCount { get; private set; }

        public List<String> History { get; private set; } = new List<String>();

        public CoinFlipViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
        }

        /// <summary>
        /// Flips the coin and updates stats
        /// </summary>
        public void FlipCoin()
        {
            if (IsFlipping) return;

            IsFlipping = true;

            bool result = _randomizer.FlipCoin();
            IsHeads = result;

            if (IsHeads) HeadsCount++;
            else TailsCount++;

            History.Insert(0, IsHeads ? "Heads" : "Tails");
            if (History.Count > 10) History.RemoveAt(10);
        }

        /// <summary>
        /// Resets the flipping state
        /// </summary>
        public void FlipComplete()
        {
            IsFlipping = false;
        }

        /// <summary>
        /// Resets all stats
        /// </summary>
        public void ResetStats()
        {
            HeadsCount = 0;
            TailsCount = 0;
            History.Clear();
        }
    }
}