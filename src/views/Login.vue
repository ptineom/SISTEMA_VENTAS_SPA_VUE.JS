<template>
  <v-container fluid>
    <v-row>
      <v-col
        cols="12"
        class="d-flex align-center justify-center"
        style="height: 100vh"
      >
        <v-card
          class="elevation-12 __b-20 rounded-lg"
          :width="370"
         
        >
          <v-img v-show="step == 1" src="../assets/imagenes/images.png"></v-img>
          <v-card-title
            class="title font-weight-regular"
            :class="{ 'py-0': step == 1 }"
          >
            <span v-show="step == 2 || step == 3">{{ getTitulo }}</span>
            <h4 v-show="step == 1" class="body-2 mb-0 text--disabled font-italic">
              Por favor ingrese sus credenciales.
            </h4>
          </v-card-title>
          <v-divider v-show="step == 2 || step == 3"></v-divider>
          <v-row>
            <v-col cols="12" class="py-0">
              <v-window v-model="step">
                <v-window-item :value="1">
                  <v-card-text>
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-text-field
                        :rules="reglas.usuario"
                        v-model="login.usuario"
                        label="Usuario"
                        type="text"
                        outlined
                        dense
                        :append-icon="'person'"
                        autofocus
                        @keyup.enter="$refs['txtPassword'].focus()"
                        required
                      />
                      <v-text-field
                        :rules="reglas.password"
                        v-model="login.password"
                        label="Contraseña"
                        :type="visibility ? 'text' : 'password'"
                        outlined
                        dense
                        ref="txtPassword"
                        :append-icon="visibility ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append="() => (visibility = !visibility)"
                        @keydown.enter="ingresar()"
                        required
                      />
                      <v-btn
                        block
                        color="primary"
                        class="text-none px-2"
                        @click="ingresar()"
                        :disabled="!valid"
                      >
                        <v-icon left>vpn_key</v-icon>Iniciar sesión
                      </v-btn>
                    </v-form>
                  </v-card-text>
                </v-window-item>

                <v-window-item :value="2">
                  <v-card-text>
                    <v-form ref="formSuc" lazy-validation v-model="validSuc">
                      <v-select
                        dense
                        label="Sede"
                        outlined
                        required
                        :items="sucursales"
                        v-model="idSucursal"
                        :rules="reglas.sucursal"
                      ></v-select>
                      <span class="caption grey--text text--darken-1">
                        Para continuar debe de seleccionar la sede.
                      </span>
                    </v-form>
                  </v-card-text>
                </v-window-item>

                <v-window-item :value="3">
                  <v-card-text>
                    <v-form ref="formRec" v-model="validRec" lazy-validation>
                      <v-text-field
                        label="Email"
                        ref="txtEmail"
                        :rules="reglas.email"
                        autofocus
                        v-model="email"
                        @keydown.enter.prevent="seguir()"
                      ></v-text-field>
                      <span class="caption grey--text text--darken-1">
                        Se le enviará un link al email ingresado aquí, donde
                        podrá restablecer su nueva contraseña.
                      </span>
                    </v-form>
                  </v-card-text>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="py-0">
              <ShowError :errors="errors"></ShowError>
            </v-col>
          </v-row>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              text
              color="primary"
              class="text-none px-2 __btn-login-text"
              @click="botonSecundario()"
            >
              <span v-show="step == 1">¿Has olvidado tu contraseña?</span>
              <v-icon v-show="step == 2 || step == 3">mdi-backburger</v-icon>
            </v-btn>
            <v-spacer />
            <v-btn
              color="success"
              depressed
              dense
              @click="seguir()"
              v-if="step == 2 || step == 3"
              :disabled="!getValid"
            >
              <v-icon>{{ getIcono }} </v-icon>
            </v-btn>
          </v-card-actions>

          <v-overlay :value="overlay" absolute :opacity="'0.36'">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>
<script src="../assets/js/Scripts/Login.js"></script>
