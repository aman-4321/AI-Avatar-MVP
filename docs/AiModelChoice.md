API Choices

1.  Avatar Image Generation: DALL·E 3

    Why DALL·E 3?

        Easy to get started quickly with simple text prompts.

        High-quality, photorealistic avatar images that closely follow user descriptions.

        Low-cost experimentation

    Alternatives Considered:

        Midjourney offers more artistic and stylized images, but requires Discord, adding complexity.

    Ideal for MVP due to ease of use, quality, and cost-effectiveness.

2.  Talking Avatar Video Generation: D-ID API

    Why D-ID?

        Simple API with a free tier for initial trials.

        Reliable lip-syncing of avatar images to custom voice audio.

        Straightforward integration to produce talking-head style videos essential for influencer content.

    Known Limitation:

        Currently produces videos with a stable avatar head and lip movement only; it does not support dynamic backgrounds or full-body avatar motion, which limits richer video storytelling.

    Alternatives Considered:

        Synthesia and Pika Labs offer richer, dynamic backgrounds and full video animation but at higher costs and with limited free access.

        Wav2Lip is open-source and customizable but requires substantial technical overhead to build full video pipelines.

    Best choice for MVP given balance of ease, cost, and core lip-sync feature.

3.  Voice Generation: ElevenLabs

    Why ElevenLabs?

        Produces natural, expressive, and versatile synthetic voices suitable for diverse influencer avatars.

        Offers a generous free tier and easy API access.

        Supports multilingual and emotional speech styles for more engaging videos.

    Alternatives Considered:

        Play.ht has a larger voice library but varies more in voice quality.

        Provides the best mix of voice quality, API ease, and cost for the MVP.

Known Limitations & Future Improvements

    D-ID videos are limited to stable talking heads without dynamic movement or background video. Future plans include exploring Synthesia or Pika Labs for richer video output.

    Deep avatar customization and stylization may be enhanced by integrating Midjourney or Leonardo AI once MVP validation is complete.

    Voice diversity could be expanded by adding more TTS providers or custom voice models.
