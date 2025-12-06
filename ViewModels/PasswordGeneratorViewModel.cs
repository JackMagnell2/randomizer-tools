using System;
using System.Collections.Generic;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// View model for password generation
    /// </summary>
    public class PasswordGeneratorViewModel
    {
        private readonly RandomizerService _randomizerService;

        public PasswordGeneratorViewModel(RandomizerService randomizerService)
        {
            _randomizerService = randomizerService;
        }

        public string CurrentPassword { get; set; } = string.Empty;

        public bool UseUpper { get; set; } = true;
        public bool UseLower { get; set; } = true;
        public bool UseDigits { get; set; } = true;
        public bool UseSymbols { get; set; } = true;

        public int StrengthScore { get; private set; }
        public string StrengthLabel { get; private set; } = "Weak";

        /// <summary>
        /// Generates strong password
        /// </summary>
        public void Generate()
        {
            CurrentPassword = _randomizerService.GeneratePassword(16, UseUpper, UseLower, UseDigits, UseSymbols);
            CalculateStrength();
        }

        /// <summary>
        /// Calculates password strength
        /// </summary>
        private void CalculateStrength()
        {
            int pools = 0;
            if (UseUpper) pools++;
            if (UseLower) pools++;
            if (UseDigits) pools++;
            if (UseSymbols) pools++;

            int score = 0;
            score += pools * 20;
            score += 20; // fixed length 16 baseline
            if (pools == 4) score += 20;

            StrengthScore = Math.Min(score, 100);

            if (StrengthScore >= 80)
                StrengthLabel = "Strong";
            else if (StrengthScore >= 50)
                StrengthLabel = "Medium";
            else
                StrengthLabel = "Weak";
        }
    }
}
