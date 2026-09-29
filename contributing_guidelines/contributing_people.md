### [Back to home](../README.md)

--- 
# Contributing Person Profiles

Events are stored in a single file: `_data/people.yml`.

## Contributing Person Profiles

Thank you for contributing to our directory of people and organisations involved in data linkage and related fields.

### Adding a New Profile

Profiles are stored as YAML entries using the following structure:

```yaml
- id: john-smith
  name: "John Smith"
  affiliation: "SeRP UK, Swansea University"
  content: "Short professional biography."
  image: "/assets/images/people/john_smith.jpg"
```

#### Required Fields

* `id` — A unique identifier for the profile.
* `name` — The person's preferred display name.
* `affiliation` — Current organisation, institution, or role.
* `content` — A short professional biography (typically 1–3 sentences).
* `image` — Path to the profile image.

### Creating a Unique ID

Use the person's name in lowercase with words separated by hyphens:

```yaml
id: john-smith
```

If an ID already exists, use one of the following approaches:

1. Include a middle initial:

   ```yaml
   id: john-t-smith
   ```
2. Use the full preferred name:

   ```yaml
   id: john-thomas-smith
   ```
3. Add a distinguishing broad location or affiliation if appropriate:

   ```yaml
   id: john-smith-swansea
   id: john-smith-serp
   ```
4. As a last resort, use a short descriptive suffix or number:

   ```yaml
   id: john-smith-2
   ```

IDs must remain stable once published.

### Privacy and Permissions

Before submitting a profile, ensure that:

* You have permission to publish the person's information and image.
* The biography accurately reflects the person's professional role.
* The profile only contains information relevant to the purpose of the website.

Do **not** include unnecessary personal information such as:

* Home addresses
* Personal phone numbers
* Personal email addresses
* Dates of birth
* Other sensitive personal details

Professional affiliations, roles, and publicly shared professional biographies are generally appropriate.

### Content Guidelines

* Keep biographies concise and professional.
* Focus on expertise, experience, and contributions relevant to the website.
* Use clear, factual language.
* Avoid promotional or marketing-style content.

### Submitting Changes

1. Create a branch for your changes.
2. Add or update the YAML entry and any associated image.
3. Verify that the YAML is valid and the image path is correct.
4. Open a pull request with a brief description of the change.
