### [Back to home](../README.md)

--- 
# Contributing Events

Events are stored in a single file: `_data/events.yml`.


Open this file and add your event under the correct `event_type` category. At this moment we have `workshops` and `showcases` as selectable categories.

## Structure Overview

The file is organised by event type. Each type contains a list of events:

```yaml
categories:
  - event_type: "workshops"  
    events:  
        - event_num: 5
            title: "Event Title"
            date: "2027-01-15" "Q1 2027"
            use_provisional_date: true  
            registration_link: "https://example.com/register"
            venue: "Venue Name, Location" "Online"
            description: >  
            Lorum ipsum
```
## Fields

| Field                  | Required | Type    | Description                                                                                                                                                                                       |
|------------------------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `event_num`            | ✅       | key     | A unique identifier for the event (e.g. `1`, `2`). Must be unique within its `event_type`.                                                                                                        |
| `title`                | ✅       | string  | Full name of the event                                                                                                                                                                            |
| `date`                 | ✅       | string  | Date in `YYYY-MM-DD` format is used for final dates, if provisional dates are being provided then provide the details you have (e.g. Q1 2027) and ensure `use_provisional_dates` is set to `true` |
| `use_provisional_date` | ✅       | boolean | `true` if the date is not yet confirmed; `false` if the date is confirmed                                                                                                                         |
| `registration_link`    | ✅       | string  | Full URL to the event registration or details page                                                                                                                                                |
| `venue`                | ✅       | string  | Venue name and location, or `"Online"` for virtual events                                                                                                                                         |
| `description`          | ✅       | string  | A short summary of the event. Use the `>` block scalar for multi-line text                                                                                                                        |