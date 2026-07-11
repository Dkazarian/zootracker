# Mission

Zootracker exists to give zoo staff a reliable, shared view of animal care. It replaces scattered spreadsheets, documents, and handwritten notes with one place to understand each animal's feeding responsibilities, feeding history, and weight history.

## What We Do

Zootracker is an internal full-stack application for managing animals and their routine feeding work.

Keepers can find animals, maintain feeding plans, see which animals they are responsible for feeding, record completed feedings, and track weight over time. Recording a planned feeding both adds it to the animal's history and satisfies the related feeding task.

Administrators manage personnel access and animal profiles. The application uses two meaningful roles, keeper and administrator, without introducing unnecessary permission complexity.

Zootracker also exposes its core operations through an API. The user interface and authorized external clients work with the same records and business rules, allowing future integrations without making Zootracker depend on a particular communication channel.

## Who We Serve

- **Zoo keepers** who need a quick way to understand and record daily feeding responsibilities and review animal history.
- **Administrators** who manage personnel access and the animal registry.
- **Authorized external clients** that need to read or maintain Zootracker data through its API.

Zootracker is an internal system. Personnel accounts are created by administrators rather than through public registration.

## What Success Looks Like

Zootracker succeeds when keepers can quickly answer:

- Which animals should I feed?
- What has this animal been fed?
- How has this animal's weight changed?
- Who recorded or corrected this information?

The system should provide a dependable workflow from feeding plan to feeding record, a clear history for each animal, controlled access for zoo personnel, and a well-defined API for future integrations.
