using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;

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
            _random = new Random(RandomNumberGenerator.GetInt32(int.MaxValue));
        }

        /// <summary>
        /// Get a random int between min (inclusive) and max (exclusive)
        /// </summary>
        public int GetRandomInt(int min, int max)
        {
            if (min > max) (min, max) = (max, min);
                return _random.Next(min, max + 1);
        }

        /// <summary>
        /// Generates a list of random numbers with options
        /// </summary>
        public List<int> GetRandomNumbers(int min, int max, int count, bool unique)
        {
            if (min > max) (min, max) = (max, min);

            long rangeSize = (long)max - min + 1;
            if (unique && rangeSize < count) unique = false;

            var results = new List<int>();
            var available = new HashSet<int>();

            for (int i = 0; i < count; i++)
            {
                int num;
                if (unique)
                {
                    do
                    {
                        num = _random.Next(min, max + 1);
                    }
                    while (!available.Add(num));
                    results.Add(num);
                }
                else
                {
                    num = _random.Next(min, max + 1);
                    results.Add(num);
                }
            }
            return results;
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

            for (int i = 0; i < teamCount; i++)
            {
                teams.Add(new List<T>());
            }

            for (int i = 0; i < shuffled.Count; i++)
            {
                teams[i % teamCount].Add(shuffled[i]);
            }

            return teams;
        }

        /// <summary>
        /// Generate a cryptographically strong password
        /// </summary>
        public string GeneratePassword(int length, bool useUpper, bool useLower, bool useDigits, bool useSymbols)
        {
            if (length < 4) length = 4;

            var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var lower = "abcdefghijklmnopqrstuvwxyz";
            var digits = "0123456789";
            var symbols = "!@$%^&*?-_=+.#";

            var pools = new List<string>();
            if (useUpper) pools.Add(upper);
            if (useLower) pools.Add(lower);
            if (useDigits) pools.Add(digits);
            if (useSymbols) pools.Add(symbols);

            if (pools.Count == 0) pools.Add(lower);

            var chars = new List<char>();

            foreach (var pool in pools)
            {
                chars.Add(GetRandomChar(pool));
            }

            var all = string.Concat(pools);
            while (chars.Count < length)
            {
                chars.Add(GetRandomChar(all));
            }

            ShuffleList(chars);
            return new string(chars.ToArray());
        }

        /// <summary>
        /// Gets a random char
        /// </summary>
        private char GetRandomChar(string pool)
        {
            var index = RandomNumberGenerator.GetInt32(pool.Length);
            return pool[index];
        }

        /// <summary>
        /// Get a random DateTime between min and max
        /// </summary>
        public DateTime GetRandomDateTime(DateTime min, DateTime max)
        {
            if (min > max) (min, max) = (max, min);
            var range = max - min;
            var maxTicks = range.Ticks;
            if (maxTicks <= 0) return min;

            Span<byte> buffer = stackalloc byte[8];
            RandomNumberGenerator.Fill(buffer);
            ulong rnd = BitConverter.ToUInt64(buffer);
            long ticks = (long)(rnd % (ulong)(maxTicks + 1));
            return min.AddTicks(ticks);
        }
    }
}
