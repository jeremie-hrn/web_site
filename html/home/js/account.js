jQuery(function() {
    $(".banner").hide();
    $(".user_input").hide();
    $(".btn_save_user").hide();
    $(".invalid_input").css("visibility", "hidden");
    user_check();
});

const apikey_data = function(text) {
    if (text.length > 25)
        return (text.substring(0, 10) + '...' + text.substring(text.length - 15))
    return text
}

const copy_apikey = function() {
    navigator.clipboard.writeText(sessionStorage.getItem("apikey"));
    $("#btn_copy_apikey i").html("check");
    $('#btn_copy_apikey').addClass("change_color_apikey");
    setTimeout(() => {
        $('#btn_copy_apikey').removeClass("change_color_apikey");
        $("#btn_copy_apikey i").html("content_copy");
    }, 5000);
}

const renew_apikey = async function() {
    $('#loader_connection').css("visibility", "visible");
    try {
        await $.ajax({
            type: 'get',
            url: `${api_url}/api/v1/identity/apikey/update/`,
            headers: {
                "APIKEY": sessionStorage.getItem("apikey"),
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            dataType: 'json',
            success: function(data) {
                sessionStorage.setItem("apikey", data.APIKEY)
                $('#form_apikey').html(apikey_data(data.APIKEY));
                $('#loader_connection').css("visibility", "hidden");
            },
            error: function(data) {
                $('#loader_connection').css("visibility", "hidden");
            },
        });
    } catch (error) {
        if (400 > error.status || error.status > 499) {
            $('.banner_error').show().addClass("volet");
            $('#loader_connection').css("visibility", "hidden");
            setTimeout(() => {
                $('.banner_error').hide().removeClass("volet");
            }, 5000);
        }
    }
}

const user_check = async function() {
    $('#loader_connection').css("visibility", "visible");
    try {
        await $.ajax({
            type: 'get',
            url: `${api_url}/api/v1/home_user/`,
            headers: {
                "APIKEY": sessionStorage.getItem("apikey"),
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            dataType: 'json',
            success: function(data) {
                $('#form_pseudo').html(data.content.pseudo);
                $('#form_inscription_date').html(format_date(data.content.inscription_date));
                $('#form_apikey').html(apikey_data(sessionStorage.getItem("apikey")));
                $('#form_name').html(data.content.name);
                $('#form_first_name').html(data.content.first_name);
                $('#form_email').html(data.content.email);
                $('#form_birthdate').html(format_date(data.content.birthdate));
                $('#loader_connection').css("visibility", "hidden");
            },
            error: function(data) {
                $('#loader_connection').css("visibility", "hidden");
            },
        });
    } catch (error) {
        if (400 > error.status || error.status > 499) {
            $('.banner_error').show().addClass("volet");
            $('#loader_connection').css("visibility", "hidden");
            setTimeout(() => {
                $('.banner_error').hide().removeClass("volet");
            }, 3000);
        }
    }
}

const edit_user = function(field){
    $("#btn_edit_" + field).hide();
    $("#btn_save_" + field).show();

    $("#form_" + field).hide();
    $("#form_input_" + field).show();
    let input = $("#form_input_" + field + " input");
    input.focus();
    if (input.attr("type") === "date")
        input.val(format_date($("#form_" + field).html()));
    else
        input.attr("placeholder", $("#form_" + field).html());
    check_field(field);
}

const check_field = function(field) {
    let input = $("#form_input_" + field + " input");

    if (input.val() === "" || input.val() === format_date($("#form_" + field).html())) {
        $("#btn_save_" + field).addClass("btn_cancel_user");
        $("#btn_save_" + field).removeClass("btn_save_user");
        $("#btn_save_" + field).html("Annuler");
        return;
    }

    $("#btn_save_" + field).removeClass("btn_cancel_user");
    $("#btn_save_" + field).addClass("btn_save_user");
    $("#btn_save_" + field).html("Enregistrer");
}

const send_user = async function(field) {
    $('#loader_connection').css("visibility", "visible");
    let input = $("#form_input_" + field + " input");
    if (input.val() === "" || input.val() === format_date($("#form_" + field).html())) {
        $("#btn_edit_" + field).show();
        $("#btn_save_" + field).hide();
        $("#form_" + field).show();
        $("#form_input_" + field).hide();
        $("#btn_save_" + field).html("Enregistrer");
        $('#loader_connection').css("visibility", "hidden");
        return;
    }

    if (field == 'email') {
        pattern = /^[a-z][-a-z_0-9.]+@[a-z-.]+$/;
        if (!pattern.test(input.val())) {
            $('.invalid_input').css("visibility", "visible").addClass('vibration');
            setTimeout(() => {
                $('.invalid_input').removeClass('vibration');
            }, 1500);
        }
    }

    data_send = {}
    data_send[field] = "" + $("#" + field + "_user").val();
    if (field == 'birthdate')
        data_send[field] = format_date(data_send[field]);
    try {
        await $.ajax({
            type: 'put',
            url: `${api_url}/api/v1/home_user/`,
            headers: {
                "APIKEY": sessionStorage.getItem("apikey"),
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            data: JSON.stringify(data_send),
            dataType: 'json',
            success: function(data) {
                user_check();
                $("#btn_edit_" + field).show();
                $("#btn_save_" + field).hide();
                $("#form_" + field).show();
                $("#form_input_" + field).hide();
                $("#btn_save_" + field).html("Enregistrer");
                $('.banner_validated').show().addClass("volet");
                $('#loader_connection').css("visibility", "hidden");
                setTimeout(() => {
                    $('.banner_validated').hide().removeClass("volet");
                }, 5000);
            },
            error: function(data) {
                $('.banner_error').show().addClass("volet");
                $('#loader_connection').css("visibility", "hidden");
                setTimeout(() => {
                    $('.banner_error').hide().removeClass("volet");
                }, 5000);
            },
        });
    } catch (error) {
        if (400 > error.status || error.status > 499) {
            $('.banner_error').show().addClass("volet");
            $('#loader_connection').css("visibility", "hidden");
            setTimeout(() => {
                $('.banner_error').hide().removeClass("volet");
            }, 5000);
        }
    }
}

var before_submit_bool = false;
var before_pass_bool = false;

const before_pass = async function() {
    old_pass_val = $('#password0').val();
    try {
        await set_masterkey();
        await $.ajax({
            type: 'put',
            url: `${api_url}/api/v1/identity/connection/`,
            headers: {
                "APIKEY": sessionStorage.getItem("masterkey"),
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                "pseudo": sessionStorage.getItem("pseudo"),
                "password": old_pass_val
            }),
            success: function(data) {
                sessionStorage.removeItem("masterkey");
                $('.not_same_as_old').css("visibility", "hidden");
                before_pass_bool = true;
            },
            error: function(data) {
                sessionStorage.removeItem("masterkey");
                $('.not_same_as_old').css("visibility", "visible").addClass('vibration');
                $('.not_same_as_old').removeClass('vibration');
                before_pass_bool = false;
            }
        });
    } catch (error) {
        if (400 > error.status || error.status > 499 ) {
            sessionStorage.removeItem("masterkey");
            $('.banner_error').show().addClass("volet");
            $('#loader_connection').css("visibility", "hidden");
            setTimeout(() => {
                $('.banner_error').hide().removeClass("volet");
            }, 5000);
        }
        before_pass_bool = false;
    }
}

const before_submit = async function() {
    if (check_pattern($('#password1').val())){
        $('#loader_connection').css("visibility", "hidden");
        before_submit_bool = false;
    }

    if ($('#password1').val() != $('#password2').val()) {
        $('.not_same_error').css("visibility", "visible").addClass('vibration');
        setTimeout(() => {
            $('.not_same_error').removeClass('vibration');
        }, 1500);
        before_submit_bool = false;
    } else {
        $('.not_same_error').css("visibility", "hidden");
    }
    $('#loader_connection').css("visibility", "hidden");
    before_submit_bool =  true;
}

const send_password = async function() {
    if (before_submit_bool && before_pass_bool) {
        $('#loader_connection').css("visibility", "visible");
        try {
            await $.ajax({
                type: 'put',
                url: `${api_url}/api/v1/home_user/password/`,
                headers: {
                    "APIKEY": sessionStorage.getItem("apikey"),
                    'Accept': 'application/json',
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    "password": $('#password1').val()
                }),
                success: function(data) {
                    $('#password0').val("");
                    $('#password1').val("");
                    $('#password2').val("");
                    $('.banner_validated').show().addClass("volet");
                    $('#loader_connection').css("visibility", "hidden");
                    setTimeout(() => {
                        $('.banner_validated').hide().removeClass("volet");
                    }, 5000);
                },
                error: function(data) {
                    $('.banner_error').show().addClass("volet");
                    $('#loader_connection').css("visibility", "hidden");
                    setTimeout(() => {
                        $('.banner_error').hide().removeClass("volet");
                    }, 5000);
                }
            });
        } catch (error) {
            if (400 > error.status || error.status > 499) {
                $('.banner_error').show().addClass("volet");
                $('#loader_connection').css("visibility", "hidden");
                setTimeout(() => {
                    $('.banner_error').hide().removeClass("volet");
                }, 5000);
            }
        }
    }
}

const remove_account = function() {

    $('#pseudo_remove_account').html(sessionStorage.getItem("pseudo"));
    var dialog = document.querySelector('dialog');
    if (! dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }

    dialog.showModal();

    dialog.querySelector('#btn_cancel_remove').addEventListener('click', function() {
        dialog.close();
    });
    dialog.querySelector('#btn_valide_remove').addEventListener('click', async function() {
        if (check_pseudo_remove()) {
            $('#loader_connection').css("visibility", "visible");
            try {
                await $.ajax({
                    type: 'delete',
                    url: `${api_url}/api/v1/home_user/`,
                    headers: {
                        "APIKEY": sessionStorage.getItem("apikey"),
                        'Accept': 'application/json',
                        "Content-Type": "application/json"
                    },
                    dataType: 'json',
                    success: function(data) {
                        $('.banner_validated').show().addClass("volet");
                        setTimeout(() => {
                            disconnected_func();
                        }, 4000);
                        setTimeout(() => {
                            $('#loader_connection').css("visibility", "hidden");
                            $('.banner_validated').hide().removeClass("volet");
                            window.location.href = "/home/";
                        }, 5000);
                    },
                    error: function(data) {
                        $('.banner_error').show().addClass("volet");
                        $('#loader_connection').css("visibility", "hidden");
                        setTimeout(() => {
                            $('.banner_error').hide().removeClass("volet");
                        }, 5000);
                    },
                });
            } catch (error) {
                if (400 > error.status || error.status > 499) {
                    $('.banner_error').show().addClass("volet");
                    $('#loader_connection').css("visibility", "hidden");
                    setTimeout(() => {
                        $('.banner_error').hide().removeClass("volet");
                    }, 5000);
                }
            }
        }
    });
}

const check_pseudo_remove = function() {
    if (sessionStorage.getItem("pseudo") === $('#input_remove_account').val()) {
        $('#input_remove_account').css('border-bottom-color', '#2385b3');
        return true;
    }
    $('#input_remove_account').css('border-bottom-color', 'red');
    return false;
}