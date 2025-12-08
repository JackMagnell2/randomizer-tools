using System;
using System.Collections.Generic;
using System.Linq;
using RandomizerTools.Services;

namespace RandomizerTools.ViewModels
{
    /// <summary>
    /// View model for random date/time picker
    /// </summary>
    public class DateTimePickerViewModel
    {
        private readonly RandomizerService _randomizerService;

        public DateTimePickerViewModel(RandomizerService randomizerService)
        {
            _randomizerService = randomizerService;
        }

        public DateTime StartDate { get; set; } = DateTime.Today;
        public DateTime EndDate { get; set; } = DateTime.Today.AddDays(7);
        public TimeOnly StartTime { get; set; } = TimeOnly.FromTimeSpan(TimeSpan.Zero);
        public TimeOnly EndTime { get; set; } = TimeOnly.FromTimeSpan(TimeSpan.FromHours(23) + TimeSpan.FromMinutes(59));
        public bool IncludeTime { get; set; } = true;
        public bool ExcludeWeekends { get; set; } = false;
        public List<DateTime> ExcludedDates { get; set; } = new();
        public int ResultCount { get; set; } = 1;
        public List<DateTime> Results { get; private set; } = new();

        /// <summary>
        /// Generates random dates/times based on current settings
        /// </summary>
        public void Generate()
        {
            Results.Clear();
            var normalized = NormalizeRange();
            var attempts = 0;
            var maxAttempts = ResultCount * 50;

            while (Results.Count < ResultCount && attempts < maxAttempts)
            {
                attempts++;
                var candidateDate = _randomizerService.GetRandomDateTime(normalized.startDate, normalized.endDate).Date;

                if (ExcludeWeekends && (candidateDate.DayOfWeek == DayOfWeek.Saturday || candidateDate.DayOfWeek == DayOfWeek.Sunday))
                    continue;

                if (ExcludedDates.Any(d => d.Date == candidateDate))
                    continue;

                DateTime finalDateTime = candidateDate;

                if (IncludeTime)
                {
                    var minDateTime = candidateDate + StartTime.ToTimeSpan();
                    var maxDateTime = candidateDate + EndTime.ToTimeSpan();
                    if (minDateTime > maxDateTime) (minDateTime, maxDateTime) = (maxDateTime, minDateTime);
                    finalDateTime = _randomizerService.GetRandomDateTime(minDateTime, maxDateTime);
                }

                Results.Add(finalDateTime);
            }
        }

        /// <summary>
        /// Ensures start/end ordering
        /// </summary>
        private (DateTime startDate, DateTime endDate) NormalizeRange()
        {
            var s = StartDate.Date;
            var e = EndDate.Date;
            if (s > e) (s, e) = (e, s);
            return (s, e);
        }

        /// <summary>
        /// Restores state
        /// </summary>
        public void RestoreState(DateTime start, DateTime end, TimeSpan startTime, TimeSpan endTime, bool includeTime, bool excludeWeekends, List<DateTime> excluded, int count)
        {
            StartDate = start;
            EndDate = end;
            StartTime = TimeOnly.FromTimeSpan(startTime);
            EndTime = TimeOnly.FromTimeSpan(endTime);
            IncludeTime = includeTime;
            ExcludeWeekends = excludeWeekends;
            ExcludedDates = excluded ?? new List<DateTime>();
            ResultCount = count < 1 ? 1 : count;
        }
    }
}
