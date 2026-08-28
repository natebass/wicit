/**
 * About page.
 */
export function AboutView() {
  return `
    <div class="col-md-8 col-md-offset-2" id="content">
      <h2>About WIC</h2>
      <p>
        WIC is a federally-funded health and nutrition program for women, infants, and children. WIC
        helps families by providing checks for buying healthy supplemental foods from WIC-authorized
        vendors, nutrition education, and help finding healthcare and other community services. In
        California, 84 WIC agencies provide services locally to over 1.45 million participants each
        month at over 650 sites throughout the State.
      </p>
      <h3>Who Is WIC For?</h3>
      <ul>
        <li>Women who are pregnant, breastfeeding, or just had a baby.</li>
        <li>Children under 5 years old (including foster children)</li>
        <li>Families with low to medium income (working families may qualify)</li>
      </ul>
      <p>
        To see if you qualify for WIC, try our<a href="/qualify/residency" data-link> 'Do I Qualify?'</a> quiz.
      </p>
      <h3>Getting Started with WIC</h3>
      <p class="important">
        Call&nbsp;<a href="tel://888-942-9675">1-888-WIC-WORKS</a> to talk to a WIC staff member who
        can help you find your local WIC office. Check out&nbsp;<a
          href="https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/Program-Landing1.aspx"
          target="_blank"
          rel="noopener"
          >California's official WIC site</a
        >
        for more official information about WIC. Watch the video below for an introduction to the
        program.
      </p>
      <div class="video-container">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/G_9w2X1AMqM?list=UUvPiebctsOpWJra4qauF8bw"
          allowfullscreen="allowfullscreen"
        ></iframe>
      </div>
      <h3>Resources</h3>
      <p>
        WIC offers lots of programs and services to help keep California healthy. From educational
         materials to programs that help participants shop at local farmers' markets, WIC can help
        make sure you and your kids get the nutrition you need.
      </p>
      <h4>Farmers' markets</h4>
      <p>
        WIC offers two programs to help you buy fruits and vegetables at your local farmers' market.
      </p>
      <ul>
        <li>
          <h5>Farmers' Market Nutrition Program (FMNP)</h5>
          <p>
            The Farmers' Market Nutrition Program (FMNP) is funded by the U.S. Department of
            Agriculture (USDA) to provide fresh, nutritious, locally grown fruits and vegetables from
            farmers' markets to WIC families and seniors. Each eligible WIC family or senior receives
            $20 in checks each season to purchase fresh fruits, vegetables, and cut herbs from a WIC
            authorized farmer at WIC authorized market in California.
          </p>
        </li>
        <li>
          <h5>WIC Fruit &amp; Vegetable Checks (FVC)</h5>
          <p>
            In October 2009, fruit and vegetables were added to the WIC food package for participants
            to purchase at authorized grocery stores. In May 2010 the first farmers' market was
            authorized to accept WIC fruit and vegetable checks. Since 2010, over 200 farmers and 35
            markets have been authorized to accept the fruit and vegetable checks.
          </p>
        </li>
      </ul>
      <h4>Educational Materials</h4>
      <p>
        The more you know about health, the easier it is to keep your kids healthy. Check out the
        official WIC site's&nbsp;<a
          href="https://www.cdph.ca.gov/Programs/CFH/DWICSN/Pages/Program-Landing1.aspx"
          target="_blank"
          rel="noopener"
          >education materials</a
        >
        for more.
      </p>
      <h3>About WICit</h3>
      <p>
        WICit and findwic.com are not affiliated with any federal or state WIC programs. WICit was
        created by&nbsp;<a href="https://opensac.org" target="_blank" rel="noopener">Code for Sacramento</a>&nbsp;to
        help Californians more easily get and use WIC. If you're interested in deploying WICit in your
        state, check out the&nbsp;<a href="https://github.com/opensacorg/wicit" target="_blank" rel="noopener">WICit github repo</a>.
      </p>
      <p class="attribution">
        The map's Shopping Cart icon designed by
        <a href="https://thenounproject.com/rjsokolov" target="_blank" rel="noopener">Roman J. Sokolov</a> from the
        <a href="https://thenounproject.com" target="_blank" rel="noopener">Noun Project</a>.<br />
        The map's Location icon designed by
        <a href="https://thenounproject.com/gilad1" target="_blank" rel="noopener">Gilad Fried</a> from the
        <a href="https://thenounproject.com" target="_blank" rel="noopener">Noun Project</a>.
      </p>
    </div>
  `;
}
