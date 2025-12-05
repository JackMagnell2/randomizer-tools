using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// Manages state for the team generator tool
    /// </summary>
    public class TeamGeneratorViewModel
    {
        private readonly RandomizerService _randomizer;

        public List<string> Names { get; private set; } = new();
        public int TeamCount { get; set; } = 2;

        public List<List<string>> GeneratedTeams { get; private set; } = new();
        
        public string LastResultSummary { get; private set; } = string.Empty;

        public TeamGeneratorViewModel(RandomizerService randomizer)
        {
            _randomizer = randomizer;
        }

        /// <summary>
        /// Adds a clean name
        /// </summary>
        public void AddName(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return;

            var split = input.Split(new[] { ',', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var name in split)
            {
                var cleanName = name.Trim();
                if (!string.IsNullOrWhiteSpace(cleanName))
                {
                    Names.Add(cleanName);
                }
            }
        }

        /// <summary>
        /// Removes a name
        /// </summary>
        public void RemoveName(string name)
        {
            Names.Remove(name);
        }

        /// <summary>
        /// Clear names
        /// </summary>
        public void ClearNames()
        {
            Names.Clear();
            GeneratedTeams.Clear();
        }

        /// <summary>
        /// Generates teams
        /// </summary>
        public void GenerateTeams()
        {
            if (Names.Count < 2) return;

            if (TeamCount < 2) TeamCount = 2;
            if (TeamCount > Names.Count) TeamCount = Names.Count;

            GeneratedTeams = _randomizer.CreateRandomTeams(Names, TeamCount);

            LastResultSummary = $"Generated {TeamCount} teams from {Names.Count} names.";
        }

        /// <summary>
        /// Restores state
        /// </summary>
        public void RestoreState(List<string> names, int teamCount, List<List<string>>? teams)
        {
            Names = names ?? new List<string>();
            TeamCount = teamCount < 2 ? 2 : teamCount;
            GeneratedTeams = teams ?? new List<List<string>>();
        }
    }
}
