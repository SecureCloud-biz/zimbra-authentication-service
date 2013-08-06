/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function($) {
    'use strict';

    $(function() {
        var loginRedirect = null; // Path to redirect to post-login.
        var logoutRedirect = null; // Path to redirect to post-logout.
        var isLoggingIn = false; // For UI update

        var $loginForm = $('#browserid-form'); // Form used to submit login.
        var $browseridInfo = $('#browserid-info'); // Useful info from backend.

        var requestArgs = $browseridInfo.data('requestArgs') || {};
        var loginFailed = location.search.indexOf('bid_login_failed=1') !== -1;

        // Call navigator.id.request whenever a login link is clicked.
        $(document).on('click', '.browserid-login', function(e) {
            e.preventDefault();

            loginRedirect = $(this).data('next');
            navigator.id.request(requestArgs);
        });

        // Call navigator.id.logout whenever a logout link is clicked.
        $(document).on('click', '.browserid-logout', function(e) {
            e.preventDefault();

            logoutRedirect = $(this).attr('href');
            navigator.id.logout();
        });

        navigator.id.watch({
            loggedInUser: $browseridInfo.data('userEmail') || null,
            onlogin: function(assertion) {
                // Avoid auto-login on failure.
                if (loginFailed) {
                    loginFailed = false;
                    return;
                }

                if (assertion) {
                    isLoggingIn = true;
                    $loginForm.find('input[name="next"]').val(loginRedirect);
                    $loginForm.find('input[name="assertion"]').val(assertion);
                    $loginForm.submit();
                }
            },
            onlogout: function() {
                // Follow the logout link's href once logout is complete.
                var currentLogoutUrl = logoutRedirect;
                if (currentLogoutUrl !== null) {
                    logoutRedirect = null;
                    window.location = currentLogoutUrl;
                } else {
                    currentLogoutUrl = $('.browserid-logout').attr('href');
                    if (currentLogoutUrl) {
                        window.location = currentLogoutUrl;
                    }
                }
            },
            onready: function() {
                if (!$browseridInfo.data('userEmail') && !isLoggingIn) {
                  $(".notification").hide();
                  $(".authentication").css('display', 'block');
                }
            }
        });

        if ($browseridInfo.data('userEmail')) {
            window.location = $('.browserid-login').data('next');
        }
    });
})(jQuery);
