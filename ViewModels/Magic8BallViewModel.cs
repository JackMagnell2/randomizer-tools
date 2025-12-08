using System.Collections.Generic;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// View model for Magic 8 Ball decision maker
    /// </summary>
    public class Magic8BallViewModel
    {
        private readonly RandomizerService _randomizerService;

        public Magic8BallViewModel(RandomizerService randomizerService)
        {
            _randomizerService = randomizerService;
        }

        public string CurrentAnswer { get; private set; } = "Ask anything...";
        public List<string> History { get; set; } = new();

        private static readonly List<string> PositiveAnswers = new()
        {
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes – definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes."
        };

        private static readonly List<string> NeutralAnswers = new()
        {
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again."
        };

        private static readonly List<string> NegativeAnswers = new()
        {
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        };

        /// <summary>
        /// Generates an answer using built-in or custom pools with bias
        /// </summary>
        public void Ask(bool useCustom, List<string> customAnswers, string bias)
        {
            List<string> pool;

            if (useCustom && customAnswers != null && customAnswers.Count > 0)
            {
                pool = customAnswers;
            }
            else
            {
                pool = bias switch
                {
                    "positive" => PositiveAnswers,
                    "neutral" => NeutralAnswers,
                    "negative" => NegativeAnswers,
                    _ => BuildBalancedPool()
                };
            }

            CurrentAnswer = _randomizerService.GetRandomItem(pool);
            History.Insert(0, CurrentAnswer);
            if (History.Count > 10) History.RemoveAt(History.Count - 1);
        }

        /// <summary>
        /// Restores stored history
        /// </summary>
        public void RestoreHistory(List<string> stored)
        {
            History = stored ?? new List<string>();
            if (History.Count > 10) History = History.GetRange(0, 10);
        }

        /// <summary>
        /// Clears stored history
        /// </summary>
        public void ClearHistory()
        {
            History.Clear();
        }

        /// <summary>
        /// All answers in one
        /// </summary>
        private List<string> BuildBalancedPool()
        {
            var pool = new List<string>();
            pool.AddRange(PositiveAnswers);
            pool.AddRange(NeutralAnswers);
            pool.AddRange(NegativeAnswers);
            return pool;
        }
    }
}
