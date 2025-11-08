using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Random;
using System.Security.Cryptography.RandomNumberGenerator;

namespace RandomizerTools.Services
{
    /// <summary>
    /// Service providing core randomization functionality for all tools
    /// </summary>
    public class RandomizerService
    {
        private readonly Random _random;

        public RandomizerService()
        {
            // RandomNumberGen for better randomness
            _random = new Random(RandomNumberGenerator.GetInt32(int.MaxValue));
        }

        /// <summary>
        /// Get a random int between min (inclusive) and max (exclusive)
        /// </summary>
        public int GetRandomInt(int min, int max)
        {
            if (min >= max)
                throw new ArgumentException("Min must be less than max");

            return _random.Next(min, max);
        }

        /// <summary>
        /// Get a random item from a list
        /// </summary>
        public T GetRandomItem<T>(List<T> items)
        {
            if (items == null || items.Count == 0)
                throw new ArgumentException("List cannot be null or empty");
            
            int index = _random.Next(items.Count);
            return items[index];
        }

        /// <summary>
        /// Shuffle a list using Fisher-Yates algorithm
        /// </summary>
        public List<T> ShuffleList<T>(List<T> items)
        {
            if (items == null || items.Count == 0)
                return new List<T>();

            var shuffled = new List<T>(items); // Make a copy
            int n = shuffled.Count;

            for (int i = n - 1; i > 0; i--)
            {
                int j = _random.Next(i + 1);
                (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
            }

            return shuffled;
        }

        /// <summary>
        /// Flip a coin, returns true for heads and false for tails
        /// </summary>
        public bool FlipCoin()
        {
            return _random.Next(2) == 0;
        }

        /// <summary>
        /// Roll a dice with specified number of sides
        /// </summary>
        public int RollDice(int sides = 6)
        {
            if (sides < 2)
                throw new ArgumentException("Dice must have at least 2 sides");

            return _random.Next(1, sides + 1);
        }

        /// <summary>
        /// Split a list into random teams of specified size
        /// </summary>
        public List<List<T>> CreateRandomTeams<T>(List<T> items, int teamCount)
        {
            if (items == null || items.Count == 0)
                throw new ArgumentException("List cannot be null or empty");

            if (teamCount < 1 || teamCount > items.Count)
                throw new ArgumentException("Invalid team count");

            var shuffled = ShuffleList(items);
            var teams = new List<List<T>>();

            // Create empty teams first
            for (int i = 0; i < teamCount; i++)
            {
                teams.Add(new List<T>());
            }

            // Distribute shuffled items across teams
            for (int i = 0; i < shuffled.Count; i++)
            {
                teams[i % teamCount].Add(shuffled[i]);
            }

            return teams;
        }
    }
}