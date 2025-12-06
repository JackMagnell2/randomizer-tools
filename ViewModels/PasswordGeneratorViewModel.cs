using System;
using System.Collections.Generic;
using System.Linq;
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
            CalculateStrength(CurrentPassword);
        }

        /// <summary>
        /// Updates password from user input and recalculates strength
        /// </summary>
        public void UpdatePassword(string value)
        {
            CurrentPassword = value ?? string.Empty;
            CalculateStrength(CurrentPassword);
        }

        /// <summary>
        /// Recalculate strength after option changes
        /// </summary>
        public void RefreshStrengthFromOptions()
        {
            CalculateStrength(CurrentPassword);
        }

        /// <summary>
        /// Calculates password strength
        /// </summary>
        private void CalculateStrength(string password)
        {
            if (password == null) password = string.Empty;

            bool hasUpper = password.Any(char.IsUpper);
            bool hasLower = password.Any(char.IsLower);
            bool hasDigit = password.Any(char.IsDigit);
            bool hasSymbol = password.Any(c => !char.IsLetterOrDigit(c));

            int pools = 0;
            if (hasUpper) pools++;
            if (hasLower) pools++;
            if (hasDigit) pools++;
            if (hasSymbol) pools++;

            int lengthScore = Math.Min(password.Length, 20) * 3;
            int poolScore = pools * 12;
            int bonus = (pools == 4 ? 12 : 0) + (password.Length >= 16 ? 12 : 0);

            StrengthScore = Math.Min(lengthScore + poolScore + bonus, 100);

            if (StrengthScore >= 80)
                StrengthLabel = "Strong";
            else if (StrengthScore >= 50)
                StrengthLabel = "Medium";
            else
                StrengthLabel = "Weak";
        }
    }
}
