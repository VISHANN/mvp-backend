async function getPublication(workId) {
  // edition.entries is an array with structure as documented
  const editions = await fetch(
    `https://openlibrary.org/works/${workId}/editions.json`
  ).then((res) => res.json());
  let latest_edition_year = -9999;
  let i = 0;

  const publication = {
    number_of_pages: null,
    first_published: "2025",
    publishers: [],
    latest_edition_index: -1,
  };

  for (const edition of editions.entries) {
    const publish_year = getPublishYear(edition.publish_date);

    // non negative publish_year means publish_year exists. see getPublishYear
    if (publish_year < 0) continue;

    if (Number(publish_year) < Number(publication.first_published)) {
      publication.first_published = publish_year;

      // if edition.publishers doesn't exit publication.publishers will be undefined. Check for undefined on clientside
      publication.publishers = edition.publishers;
    } else if (edition.number_of_pages && latest_edition_year < publish_year) {
      // if edition has languages and its not english pass on the edition.
      if (edition.languages && edition.languages[0].key !== "/languages/eng") {
        continue;
      }

      // if publish year is bigger than latest_edition_year assign latest_edition_year to publish_year
      latest_edition_year = publish_year;

      publication.number_of_pages = edition.number_of_pages;
      publication.latest_edition_index = i;
    }

    // increment the loop iterable
    i++;
  }

  return publication;
}

function getPublishYear(publish_date) {
  if (!publish_date) return -1;

  // split publish_date string and get the last item.
  let publish_year = publish_date.split(" ").at(-1);

  // check if publish_year is purely numeric string return
  // else it is of two type: 2001-04-21 or 2002jhg

  if (/^[0-9]+$/.test(publish_year)) return publish_year;

  // case: 2001-04-24
  if (publish_year.indexOf("-") > -1) {
    publish_year.split("-").forEach((element) => {
      element.length === 4 ? (publish_year = element) : null;
    });
  } else {
    // case: 3004jhg
    // replace all non-digits with ''
    publish_year = publish_year.replace(/\D/g, "");
  }

  return publish_year;
}


module.exports = { getPublication };